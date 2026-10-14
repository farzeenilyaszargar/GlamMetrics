import { z } from "zod";
import { authenticate, ApiError, failure, jsonBody } from "@/lib/server";
import { hasRecoverableIdentity } from "@/lib/identity";
export async function POST(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    if (!hasRecoverableIdentity(user))
      throw new ApiError("Verify your email or connect Google first.", 403);
    const parsed = z
      .object({ guestToken: z.string().min(20).max(5000) })
      .safeParse(await jsonBody(request, 6000));
    if (!parsed.success) throw new ApiError("Invalid guest session.");
    const guest = await db.auth.getUser(parsed.data.guestToken);
    if (guest.error || !guest.data.user?.is_anonymous)
      throw new ApiError("Your guest session could not be verified.", 403);
    const { data, error } = await db.rpc("claim_guest_reports", {
      p_guest: guest.data.user.id,
      p_owner: user.id,
    });
    if (error)
      throw new ApiError(
        "Your guest plan couldn't be attached yet. Please retry after processing finishes.",
        503,
      );
    return Response.json(
      { moved: data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return failure(e);
  }
}
