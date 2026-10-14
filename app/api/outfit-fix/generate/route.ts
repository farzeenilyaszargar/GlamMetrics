import { z } from "zod";
import { authenticate, ApiError, failure, jsonBody } from "@/lib/server";
import { analyzeOutfit } from "@/lib/ai-style";
import { occasions } from "@/lib/catalog";
export const runtime = "nodejs";
export const maxDuration = 90;
const input = z.object({
  id: z.string().uuid(),
  image: z
    .string()
    .max(6_000_000)
    .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/),
  occasion: z.enum(occasions),
  notes: z.string().max(500),
  consent: z.literal(true),
});
export async function POST(request: Request) {
  let reservation: {
    db: Awaited<ReturnType<typeof authenticate>>["db"];
    user: string;
    id: string;
    attempt: number;
  } | null = null;
  try {
    const { db, user } = await authenticate(request);
    const parsed = input.safeParse(await jsonBody(request, 6_010_000));
    if (!parsed.success)
      throw new ApiError(
        "Choose a clear outfit photo, occasion and consent to continue.",
      );
    if (!process.env.OPENAI_API_KEY)
      throw new ApiError(
        "Styling is temporarily unavailable. Your paid purchase remains available to retry.",
        503,
      );
    const body = parsed.data;
    const { data: attempt, error } = await db.rpc("reserve_outfit_fix", {
      p_user: user.id,
      p_id: body.id,
      p_occasion: body.occasion,
    });
    if (error) throw error;
    if (attempt === -1)
      throw new ApiError(
        "A verified ₹99 payment is required for this Outfit Fix.",
        402,
      );
    if (attempt === -2)
      throw new ApiError(
        "Your fix is processing. Check again in two minutes; don't pay again.",
        409,
      );
    if (attempt === -3)
      throw new ApiError(
        "We couldn't finish after several attempts. Contact support with this purchase reference for help or a refund. Don't pay again.",
        409,
      );
    if (attempt === 0) {
      const { data, error: e } = await db
        .from("outfit_purchases")
        .select("result,occasion")
        .eq("id", body.id)
        .eq("user_id", user.id)
        .single();
      if (e) throw e;
      return Response.json(data);
    }
    reservation = { db, user: user.id, id: body.id, attempt };
    const result = await analyzeOutfit({
      ...body,
      budget: "Use what I own",
      singleLook: true,
      styleProfile:
        typeof user.user_metadata?.style_preferences === "string"
          ? user.user_metadata.style_preferences.slice(0, 500)
          : "",
    });
    const { data: saved, error: saveError } = await db.rpc(
      "finish_outfit_fix",
      { p_user: user.id, p_id: body.id, p_attempt: attempt, p_result: result },
    );
    if (saveError || !saved)
      throw new ApiError(
        "Result could not be saved. Check this purchase before retrying; you won't pay again.",
        503,
      );
    reservation = null;
    return Response.json({ result, occasion: body.occasion });
  } catch (e) {
    if (reservation)
      await reservation.db.rpc("finish_outfit_fix", {
        p_user: reservation.user,
        p_id: reservation.id,
        p_attempt: reservation.attempt,
        p_result: null,
      });
    return failure(e);
  }
}
