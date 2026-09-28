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
      .single();
    if (error || !data) throw new ApiError("Report not found.", 404);
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
    return Response.json({ success: true });
  } catch (error) {
    return failure(error);
  }
}
