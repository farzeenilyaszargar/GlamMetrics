import { z } from "zod";
import { authenticate, ApiError, failure, jsonBody } from "@/lib/server";
import { razorpay, signatureValid } from "@/lib/payments";
import { confirmOutfitPayment } from "@/lib/outfit-payments";

const idSchema = z.string().uuid();
export async function POST(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const { id } = z.object({ id: idSchema }).parse(await jsonBody(request));
    if (
      !process.env.OPENAI_API_KEY ||
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    )
      throw new ApiError(
        "Checkout is being prepared. No payment has been taken.",
        503,
      );
    if (
      process.env.RAZORPAY_KEY_ID.startsWith("rzp_live_") &&
      (!process.env.RAZORPAY_WEBHOOK_SECRET ||
        !process.env.NEXT_PUBLIC_SUPPORT_EMAIL)
    )
      throw new ApiError("Live checkout is not available yet.", 503);
    const { error: profileError } = await db
      .from("profiles")
      .upsert({ id: user.id }, { onConflict: "id", ignoreDuplicates: true });
    if (profileError) throw profileError;
    const { data: prior, error: readError } = await db
      .from("outfit_purchases")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (readError)
      throw new ApiError(
        "Checkout setup is incomplete. No payment has been taken.",
        503,
      );
    if (prior && prior.user_id !== user.id)
      throw new ApiError("Purchase not found.", 404);
    if (prior?.status === "paid" || prior?.status === "refunded")
      return Response.json({ id, status: prior.status });
    let order = prior?.provider_order_id;
    if (!order && prior && prior.status !== "failed") {
      // Never recreate on ambiguous timeouts: recover the original provider order.
      const candidates = await razorpay(
        `orders?count=100&from=${Math.floor(new Date(prior.created_at).getTime() / 1000) - 60}`,
      );
      order = candidates.items?.find(
        (o: { receipt?: string }) => o.receipt === id,
      )?.id;
      if (!order)
        throw new ApiError(
          "Your checkout is still being confirmed. Retry shortly or contact support with your purchase reference. Don't start another payment.",
          409,
        );
    }
    if (!order) {
      const { count, error: countError } = await db
        .from("outfit_purchases")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 3600000).toISOString());
      if (countError) throw countError;
      if ((count || 0) >= 10)
        throw new ApiError("Too many checkouts. Please try later.", 429);
      const saved = prior
        ? await db
            .from("outfit_purchases")
            .update({ status: "creating" })
            .eq("id", id)
            .eq("status", "failed")
            .select("id")
            .single()
        : await db
            .from("outfit_purchases")
            .insert({ id, user_id: user.id })
            .select("id")
            .single();
      if (saved.error)
        throw new ApiError(
          "A checkout is already starting. Retry shortly.",
          409,
        );
      try {
        const created = await razorpay("orders", {
          method: "POST",
          body: JSON.stringify({
            amount: 9900,
            currency: "INR",
            receipt: id,
            notes: { outfit_fix: id },
          }),
        });
        order = created.id;
      } catch (e) {
        if (e instanceof ApiError && [422, 503].includes(e.status))
          await db
            .from("outfit_purchases")
            .update({ status: "failed" })
            .eq("id", id);
        throw e;
      }
    }
    const { error } = await db
      .from("outfit_purchases")
      .update({ provider_order_id: order, status: "created" })
      .eq("id", id)
      .in("status", ["creating", "created"]);
    if (error) throw error;
    return Response.json({
      id,
      order_id: order,
      key: process.env.RAZORPAY_KEY_ID,
      amount: 9900,
      currency: "INR",
      status: "created",
      email: user.email || "",
    });
  } catch (e) {
    return failure(e);
  }
}

export async function PATCH(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const body = z
      .object({
        id: idSchema,
        razorpay_payment_id: z.string().regex(/^pay_[a-zA-Z0-9]+$/),
        razorpay_order_id: z.string(),
        razorpay_signature: z.string(),
      })
      .parse(await jsonBody(request));
    const { data, error } = await db
      .from("outfit_purchases")
      .select("provider_order_id")
      .eq("id", body.id)
      .eq("user_id", user.id)
      .single();
    if (error || !data || data.provider_order_id !== body.razorpay_order_id)
      throw new ApiError("Purchase not found.", 404);
    if (
      !signatureValid(
        `${data.provider_order_id}|${body.razorpay_payment_id}`,
        body.razorpay_signature,
        process.env.RAZORPAY_KEY_SECRET || "",
      )
    )
      throw new ApiError("Invalid payment signature.", 401);
    await confirmOutfitPayment(
      body.razorpay_payment_id,
      data.provider_order_id,
    );
    return Response.json({ verified: true });
  } catch (e) {
    return failure(e);
  }
}

export async function GET(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const id = idSchema.parse(new URL(request.url).searchParams.get("id"));
    const { data, error } = await db
      .from("outfit_purchases")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (error || !data)
      throw new ApiError("Purchase not found in this account or browser.", 404);
    if (data.status === "created" && data.provider_order_id) {
      const payments = await razorpay(
        `orders/${data.provider_order_id}/payments`,
      );
      const captured = payments.items?.find((p: { status: string }) =>
        ["captured", "refunded"].includes(p.status),
      );
      if (captured)
        await confirmOutfitPayment(captured.id, data.provider_order_id);
    }
    const { data: fresh, error: refreshError } = await db
      .from("outfit_purchases")
      .select("id,status,result,occasion,attempts")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (refreshError) throw refreshError;
    return Response.json(fresh, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return failure(e);
  }
}
