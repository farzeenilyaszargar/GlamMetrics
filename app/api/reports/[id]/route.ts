import { authenticate, ApiError, failure } from "@/lib/server";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { db, user } = await authenticate(request);
    const { id } = await context.params;
    const { data, error } = await db
      .from("reports")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("status", "complete")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      const { data: purchase, error: e } = await db
        .from("outfit_purchases")
        .select("id,result,occasion,created_at")
        .eq("id", id)
        .eq("user_id", user.id)
        .eq("hidden", false)
        .not("result", "is", null)
        .maybeSingle();
      if (e || !purchase) throw new ApiError("Report not found.", 404);
      return Response.json(purchase, {
        headers: { "Cache-Control": "no-store" },
      });
    }
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return failure(error);
  }
}
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { db, user } = await authenticate(request);
    const { id } = await context.params;
    const { error } = await db
      .from("reports")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .neq("status", "pending");
    if (error) throw error;
    const { error: hideError } = await db
      .from("outfit_purchases")
      .update({ hidden: true })
      .eq("id", id)
      .eq("user_id", user.id)
      .not("result", "is", null);
    if (hideError) throw hideError;
    return Response.json({ success: true });
  } catch (error) {
    return failure(error);
  }
}
