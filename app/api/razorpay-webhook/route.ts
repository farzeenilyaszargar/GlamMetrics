import { adminDb, ApiError, failure } from "@/lib/server";
import { signatureValid, razorpay } from "@/lib/payments";
import { syncSubscription } from "@/lib/subscriptions";
export async function POST(request: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) throw new ApiError("Webhook not configured.", 503);
    const text = await request.text();
    if (text.length > 100000) throw new ApiError("Payload too large.", 413);
    if (
      !signatureValid(
        text,
        request.headers.get("x-razorpay-signature") || "",
        secret,
      )
    )
      throw new ApiError("Invalid signature.", 401);
    const event = JSON.parse(text);
    if (event.event === "refund.processed") {
      const id = event.payload?.refund?.entity?.payment_id;
      if (typeof id !== "string" || !/^pay_[a-zA-Z0-9]+$/.test(id))
        throw new ApiError("Invalid refund event.");
      const payment = await razorpay(`payments/${id}`);
      if (payment.amount_refunded >= payment.amount) {
        const { error } = await adminDb().rpc("revoke_refunded_payment", {
          p_payment: id,
        });
        if (error) throw error;
      }
    }
    const sub = event.payload?.subscription?.entity;
    if (event.event?.startsWith("subscription.") && sub?.id) {
      // Recover the durable local reservation when a creation response was lost.
      if (sub.notes?.local_id && sub.notes?.user_id) {
        const { error } = await adminDb()
          .from("subscriptions")
          .update({ provider_id: sub.id })
          .eq("id", sub.notes.local_id)
          .eq("user_id", sub.notes.user_id)
          .is("provider_id", null);
        if (error) throw error;
      }
      await syncSubscription(
        sub.id,
        event.event === "subscription.charged"
          ? event.payload?.payment?.entity?.id
          : undefined,
      );
    }
    return Response.json({ received: true });
  } catch (e) {
    return failure(e);
  }
}
