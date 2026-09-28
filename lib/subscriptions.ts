import { adminDb, ApiError } from "@/lib/server";
import { razorpay } from "@/lib/payments";
export async function syncSubscription(id: string, paymentId?: string) {
  if (!/^sub_[a-zA-Z0-9]+$/.test(id))
    throw new ApiError("Invalid subscription.");
  const db = adminDb();
  const sub = await razorpay(`subscriptions/${id}`);
  if (sub.plan_id !== process.env.RAZORPAY_PLAN_ID)
    throw new ApiError("Subscription plan mismatch.");
  const { error } = await db
    .from("subscriptions")
    .update({
      status: sub.status,
      current_end: sub.current_end
        ? new Date(sub.current_end * 1000).toISOString()
        : null,
      cancel_at_end: !!sub.has_scheduled_changes,
    })
    .eq("provider_id", id);
  if (error) throw error;
  if (!sub.current_start || !sub.current_end)
    return { status: sub.status, credited: false };
  let payment;
  if (paymentId) payment = await razorpay(`payments/${paymentId}`);
  else {
    const invoices = await razorpay(`invoices?subscription_id=${id}&count=100`);
    const paid = invoices.items
      ?.filter(
        (i: { status: string; paid_at: number; payment_id: string }) =>
          i.status === "paid" &&
          i.paid_at >= sub.current_start &&
          i.paid_at < sub.current_end,
      )
      .sort(
        (a: { paid_at: number }, b: { paid_at: number }) =>
          b.paid_at - a.paid_at,
      )[0];
    if (paid?.payment_id)
      payment = await razorpay(`payments/${paid.payment_id}`);
  }
  if (
    !payment ||
    payment.status !== "captured" ||
    payment.amount !== 9900 ||
    payment.currency !== "INR" ||
    !payment.invoice_id ||
    payment.created_at < sub.current_start - 120 ||
    payment.created_at >= sub.current_end
  )
    return { status: sub.status, credited: false };
  const invoice = await razorpay(`invoices/${payment.invoice_id}`);
  if (
    invoice.subscription_id !== id ||
    invoice.payment_id !== payment.id ||
    invoice.status !== "paid"
  )
    throw new ApiError("Subscription payment mismatch.");
  const { error: creditError } = await db.rpc("credit_subscription", {
    p_subscription: id,
    p_payment: payment.id,
    p_amount: payment.amount,
    p_start: new Date(sub.current_start * 1000).toISOString(),
    p_end: new Date(sub.current_end * 1000).toISOString(),
  });
  if (creditError) throw creditError;
  return { status: sub.status, credited: true };
}
