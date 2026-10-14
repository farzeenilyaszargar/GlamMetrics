import { authenticate, ApiError, failure } from "@/lib/server";
import { razorpay } from "@/lib/payments";
import { syncSubscription } from "@/lib/subscriptions";
// Retain management for existing customers, but never create new mandates.
export async function POST() {
  return Response.json(
    {
      error:
        "Subscriptions are no longer sold. Get an Outfit Fix for ₹99 once.",
    },
    { status: 410 },
  );
}
export async function PATCH(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const { data, error } = await db
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .not("status", "in", "(cancelled,completed,expired,failed)")
      .maybeSingle();
    if (error) throw error;
    if (!data?.provider_id)
      throw new ApiError("No active membership found.", 404);
    return Response.json(await syncSubscription(data.provider_id));
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const { data, error } = await db
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .not("status", "in", "(cancelled,completed,expired,failed)")
      .maybeSingle();
    if (error) throw error;
    if (!data?.provider_id)
      throw new ApiError("No active membership found.", 404);
    const provider = await razorpay(`subscriptions/${data.provider_id}`);
    if (!["cancelled", "completed", "expired"].includes(provider.status))
      await razorpay(`subscriptions/${data.provider_id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ cancel_at_cycle_end: 0 }),
      });
    const { error: saveError } = await db
      .from("subscriptions")
      .update({ status: "cancelled", cancel_at_end: false })
      .eq("id", data.id);
    if (saveError) throw saveError;
    return Response.json({ success: true });
  } catch (e) {
    return failure(e);
  }
}
