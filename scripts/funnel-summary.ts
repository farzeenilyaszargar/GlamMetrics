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
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "complete")
      .gte("created_at", since),
    db
      .from("subscription_payments")
      .select("payment_id", { count: "exact", head: true })
      .eq("refunded", false)
      .gte("period_start", since),
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
        verifiedUnrefundedBillingCycles: payments.count,
        note: "Profiles include guest sessions and are NOT verified signups. Counts include all sources. Deleted plans are excluded. Billing cycles include renewals; they are not unique customers. Test-mode cycles are not revenue.",
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
