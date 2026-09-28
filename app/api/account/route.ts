import { authenticate, failure } from "@/lib/server";
export async function GET(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const { error: insertError } = await db
      .from("profiles")
      .upsert({ id: user.id }, { onConflict: "id", ignoreDuplicates: true });
    if (insertError) throw insertError;
    const [
      { data: profile, error: p },
      { data: reports, error: r },
      { data: subscriptions, error: o },
    ] = await Promise.all([
      db
        .from("profiles")
        .select("credits,period_end")
        .eq("id", user.id)
        .single(),
      db
        .from("reports")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "complete")
        .order("created_at", { ascending: false })
        .limit(100),
      db
        .from("subscriptions")
        .select("id,status,current_end,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);
    if (p || r || o) throw p || r || o;
    if (
      profile?.period_end &&
      new Date(profile.period_end).getTime() <= Date.now()
    )
      profile.credits = 0;
    return Response.json(
      { profile, reports, subscription: subscriptions?.[0] || null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
