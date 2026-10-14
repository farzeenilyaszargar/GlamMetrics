import { adminDb, ApiError } from "@/lib/server";
import { razorpay } from "@/lib/payments";

export async function confirmOutfitPayment(
  paymentId: string,
  expectedOrder?: string,
) {
  if (!/^pay_[a-zA-Z0-9]+$/.test(paymentId))
    throw new ApiError("Invalid payment.");
  const payment = await razorpay(`payments/${paymentId}`);
  if (expectedOrder && payment.order_id !== expectedOrder)
    throw new ApiError("Payment belongs to a different order.", 409);
  if (
    payment.amount !== 9900 ||
    payment.currency !== "INR" ||
    !payment.order_id
  )
    throw new ApiError("Payment does not match this product.", 409);
  if (payment.status !== "captured" && payment.status !== "refunded")
    throw new ApiError(
      "Payment is awaiting capture. Check payment status shortly; don't pay again.",
      409,
    );
  const db = adminDb();
  const { data: known, error: lookupError } = await db
    .from("outfit_purchases")
    .select("id")
    .eq("provider_order_id", payment.order_id)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (!known) {
    const order = await razorpay(`orders/${payment.order_id}`);
    if (!order.notes?.outfit_fix) return; // Legacy or unrelated merchant order.
    const { data, error: recoveryError } = await db
      .from("outfit_purchases")
      .update({ provider_order_id: order.id })
      .eq("id", order.notes.outfit_fix)
      .is("provider_order_id", null)
      .select("id")
      .single();
    if (recoveryError || !data)
      throw new ApiError("Purchase reconciliation is pending.", 503);
  }
  const { error } = await adminDb().rpc("pay_outfit_fix", {
    p_order: payment.order_id,
    p_payment: payment.id,
    p_amount: payment.amount,
    p_currency: payment.currency,
    p_refunded: payment.amount_refunded >= payment.amount,
  });
  if (error) throw error;
}
