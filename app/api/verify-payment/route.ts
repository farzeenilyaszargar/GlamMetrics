import { authenticate, ApiError, failure, jsonBody } from "@/lib/server";
import { signatureValid } from "@/lib/payments";
import { syncSubscription } from "@/lib/subscriptions";
export async function POST(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const body = await jsonBody(request);
    if (
      typeof body.razorpay_subscription_id !== "string" ||
      typeof body.razorpay_signature !== "string" ||
      !/^pay_[a-zA-Z0-9]+$/.test(body.razorpay_payment_id)
    )
      throw new ApiError("Invalid payment response.");
    const { data, error } = await db
      .from("subscriptions")
      .select("provider_id")
      .eq("provider_id", body.razorpay_subscription_id)
      .eq("user_id", user.id)
      .single();
    if (error || !data) throw new ApiError("Subscription not found.", 404);
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (
      !secret ||
      !signatureValid(
        `${body.razorpay_payment_id}|${data.provider_id}`,
        body.razorpay_signature,
        secret,
      )
    )
      throw new ApiError("Payment could not be verified.");
    const result = await syncSubscription(
      data.provider_id,
      body.razorpay_payment_id,
    );
    return Response.json({ success: true, ...result });
  } catch (e) {
    return failure(e);
  }
}
