import { z } from "zod";
import { authenticate, ApiError, failure, jsonBody } from "@/lib/server";
import { analyzeOutfit } from "@/lib/ai-style";
import { occasions } from "@/lib/catalog";
import { guestTrialsEnabled } from "@/lib/identity";
export const runtime = "nodejs";
export const maxDuration = 90;
const input = z.object({
  id: z.string().uuid(),
  image: z
    .string()
    .max(6_000_000)
    .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/),
  occasion: z.enum(occasions),
  budget: z.enum([
    "Under ₹1,000",
    "₹1,000–₹3,000",
    "₹3,000–₹5,000",
    "Use what I own",
  ]),
  notes: z.string().max(500),
  consent: z.literal(true),
});
export async function POST(request: Request) {
  let reservation: {
    db: ReturnType<typeof import("@/lib/server").adminDb>;
    user: string;
    id: string;
  } | null = null;
  try {
    const { db, user } = await authenticate(request);
    if (user.is_anonymous && !guestTrialsEnabled)
      throw new ApiError(
        "Guest plans are currently unavailable. Please sign in to continue.",
        403,
      );
    const parsed = input.safeParse(await jsonBody(request, 6_010_000));
    if (!parsed.success)
      throw new ApiError(
        "Please choose a JPG, PNG or WebP outfit photo and complete the form.",
      );
    if (!process.env.OPENAI_API_KEY)
      throw new ApiError(
        "Style reviews are temporarily unavailable. No credit has been used.",
        503,
      );
    const body = parsed.data;
    const guestLimit = Number(process.env.GUEST_DAILY_PLAN_LIMIT || 40);
    if (
      user.is_anonymous &&
      (!Number.isInteger(guestLimit) || guestLimit < 1 || guestLimit > 1000)
    )
      throw new ApiError(
        "Guest plans are temporarily unavailable. No credit has been used.",
        503,
      );
    const { data: state, error } = await db.rpc(
      user.is_anonymous ? "reserve_guest_report" : "reserve_report",
      {
        p_user: user.id,
        p_id: body.id,
        p_occasion: body.occasion,
        ...(user.is_anonymous ? { p_limit: guestLimit } : {}),
      },
    );
    if (error) {
      if (user.is_anonymous)
        throw new ApiError(
          "Guest plans are temporarily unavailable. No credit was used. Please sign in or try again shortly.",
          503,
        );
      throw error;
    }
    if (state === "guest_limited")
      throw new ApiError(
        "Today’s guest plans have been claimed. Sign in to use your account or try again tomorrow.",
        429,
      );
    if (state === "complete") {
      const { data, error: e } = await db
        .from("reports")
        .select("*")
        .eq("id", body.id)
        .eq("user_id", user.id)
        .single();
      if (e) throw e;
      return Response.json(data);
    }
    if (state === "empty")
      throw new ApiError(
        "You're out of reviews. Join the Style Circle or wait for your next monthly allocation.",
        402,
      );
    if (state !== "reserved")
      throw new ApiError(
        state === "failed"
          ? "This review expired. Start a new review; your credit was returned."
          : "A review is already processing, or you've reached the hourly limit. Please try again later.",
        state === "failed" ? 409 : 429,
      );
    reservation = { db, user: user.id, id: body.id };
    const styleProfile =
      typeof user.user_metadata?.style_preferences === "string"
        ? user.user_metadata.style_preferences.slice(0, 500)
        : "";
    const result = await analyzeOutfit({ ...body, styleProfile });
    const { data: saved, error: saveError } = await db.rpc("finish_report", {
      p_user: user.id,
      p_id: body.id,
      p_result: result,
    });
    if (saveError || !saved)
      throw saveError || new Error("Reservation expired");
    reservation = null;
    return Response.json({
      id: body.id,
      result,
      occasion: body.occasion,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    if (reservation) {
      const { error: refundError } = await reservation.db.rpc("finish_report", {
        p_user: reservation.user,
        p_id: reservation.id,
        p_result: null,
      });
      if (refundError) console.error("Credit recovery pending", reservation.id);
    }
    return failure(error);
  }
}
