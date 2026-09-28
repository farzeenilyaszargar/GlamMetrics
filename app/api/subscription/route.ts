import { authenticate, ApiError, failure } from "@/lib/server";
import { razorpay } from "@/lib/payments";
import { syncSubscription } from "@/lib/subscriptions";
export async function POST(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    if (!process.env.RAZORPAY_PLAN_ID)
      throw new ApiError(
        "Membership checkout is being prepared. Please try again soon.",
        503,
      );
    const { error: p } = await db
      .from("profiles")
      .upsert({ id: user.id }, { onConflict: "id", ignoreDuplicates: true });
    if (p) throw p;
    const { data: existing, error: e } = await db
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .not("status", "in", "(cancelled,completed,expired,failed)")
      .maybeSingle();
    if (e) throw e;
    if (existing?.provider_id) {
      await syncSubscription(existing.provider_id);
      const provider = await razorpay(`subscriptions/${existing.provider_id}`);
      if (provider.status === "created")
        return Response.json({
          subscription_id: provider.id,
          key: process.env.RAZORPAY_KEY_ID,
          email: user.email,
        });
      if (!["cancelled", "completed", "expired"].includes(provider.status))
        throw new ApiError(
          "You already have a membership. Manage it in My edits.",
          409,
        );
    } else if (existing) {
      // Recover a provider response lost in transit using its durable local reference.
      const candidates = await razorpay(
        `subscriptions?count=100&from=${Math.floor(new Date(existing.created_at).getTime() / 1000) - 60}`,
      );
      const recovered = candidates.items?.find(
        (s: { notes?: { local_id?: string } }) =>
          s.notes?.local_id === existing.id,
      );
      if (recovered) {
        const { error } = await db
          .from("subscriptions")
          .update({ provider_id: recovered.id, status: recovered.status })
          .eq("id", existing.id);
        if (error) throw error;
        return Response.json({
          subscription_id: recovered.id,
          key: process.env.RAZORPAY_KEY_ID,
          email: user.email,
        });
      }
      throw new ApiError(
        "Your previous checkout hasn't been confirmed yet. Please contact support before retrying; this prevents duplicate subscriptions.",
        409,
      );
    }
    const id = crypto.randomUUID();
    const { error: insertError } = await db
      .from("subscriptions")
      .insert({ id, user_id: user.id });
    if (insertError)
      throw new ApiError(
        "A checkout is already in progress. Please refresh.",
        409,
      );
    // A creation timeout is left pending for reconciliation, never blindly retried.
    let sub;
    try {
      sub = await razorpay("subscriptions", {
        method: "POST",
        body: JSON.stringify({
          plan_id: process.env.RAZORPAY_PLAN_ID,
          total_count: 120,
          quantity: 1,
          customer_notify: 1,
          notes: { user_id: user.id, local_id: id },
        }),
      });
    } catch (error) {
      if (error instanceof ApiError && [422, 503].includes(error.status))
        await db
          .from("subscriptions")
          .update({ status: "failed" })
          .eq("id", id);
      throw error;
    }
    const { error: saveError } = await db
      .from("subscriptions")
      .update({ provider_id: sub.id, status: sub.status })
      .eq("id", id);
    if (saveError) throw saveError;
    return Response.json({
      subscription_id: sub.id,
      key: process.env.RAZORPAY_KEY_ID,
      email: user.email,
    });
  } catch (e) {
    return failure(e);
  }
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
