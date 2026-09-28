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
    const { data: state, error } = await db.rpc("reserve_report", {
      p_user: user.id,
      p_id: body.id,
      p_occasion: body.occasion,
    });
    if (error) throw error;
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
    const result = await analyzeOutfit(body);
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
