// Aggregate operator counts only; never prints customer identities or secrets.
import { createClient } from "@supabase/supabase-js";
async function main() {
  const days = Number(process.argv[2] || 14);
  if (!Number.isInteger(days) || days < 1 || days > 365)
    throw new Error("Choose a whole number of days between 1 and 365.");
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const [accounts, plans, payments] = await Promise.all([
    db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since),
    db
      .from("outfit_purchases")
      .select("id", { count: "exact", head: true })
      .not("result", "is", null)
      .gte("created_at", since),
    db
      .from("outfit_purchases")
      .select("payment_id", { count: "exact", head: true })
      .eq("status", "paid")
      .gte("created_at", since),
  ]);
  for (const result of [accounts, plans, payments])
    if (result.error)
      throw new Error(`Metrics unavailable (${result.error.code})`);
  console.log(
    JSON.stringify(
      {
        days,
        paymentMode: process.env.RAZORPAY_KEY_ID?.startsWith("rzp_live_")
          ? "live"
          : "test",
        newProfilesIncludingGuests: accounts.count,
        retainedCompletedPlans: plans.count,
        verifiedUnrefundedOutfitPurchases: payments.count,
        note: "Profiles include guests, not verified signups. Counts include all sources; no ad attribution. Delivery count includes hidden/refunded results. Payments are one-off purchases, not unique customers; date filter uses purchase creation. Test-mode payments are not revenue.",
      },
      null,
      2,
    ),
  );
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : "Metrics unavailable");
  process.exitCode = 1;
});
