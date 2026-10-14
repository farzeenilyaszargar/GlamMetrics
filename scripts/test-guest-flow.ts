// Hosted guest/linking security smoke test; no emails, payments, or AI calls.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  const admin = createClient(
    url,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    options,
  );
  const guestClient = createClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options,
  );
  const ownerClient = createClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options,
  );
  const origin = process.env.TEST_APP_URL || "http://localhost:3000";
  assert.equal(new URL(origin).hostname, "localhost");
  const ids: string[] = [],
    reportId = randomUUID();
  let reserved = false;
  try {
    const guest = await guestClient.auth.signInAnonymously();
    assert.ifError(guest.error);
    ids.push(guest.data.user!.id);
    assert.equal(guest.data.user!.is_anonymous, true);
    const email = `glammetrics-claim-${randomUUID()}@example.com`,
      password = randomUUID() + randomUUID();
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    assert.ifError(created.error);
    ids.push(created.data.user!.id);
    const signedIn = await ownerClient.auth.signInWithPassword({
      email,
      password,
    });
    assert.ifError(signedIn.error);
    const guestHeaders = {
      Authorization: `Bearer ${guest.data.session!.access_token}`,
      "Content-Type": "application/json",
    };
    const ownerHeaders = {
      Authorization: `Bearer ${signedIn.data.session!.access_token}`,
      "Content-Type": "application/json",
    };
    const account = await fetch(origin + "/api/account", {
      headers: guestHeaders,
    });
    assert.equal(account.status, 200);
    const checkout = await fetch(origin + "/api/subscription", {
      method: "POST",
      headers: guestHeaders,
    });
    assert.equal(
      checkout.status,
      403,
      "guest cannot create an unrecoverable recurring mandate",
    );
    const trial = await admin.rpc("reserve_guest_report", {
      p_user: ids[0],
      p_id: reportId,
      p_occasion: "Guest claim test",
      p_limit: 40,
    });
    assert.ifError(trial.error);
    assert.equal(trial.data, "reserved");
    reserved = true;
    const finished = await admin.rpc("finish_report", {
      p_user: ids[0],
      p_id: reportId,
      p_result: { title: "Temporary ownership test" },
    });
    assert.ifError(finished.error);
    const claimBody = JSON.stringify({
      guestToken: guest.data.session!.access_token,
    });
    assert.equal(
      (
        await fetch(origin + "/api/claim-guest", {
          method: "POST",
          headers: guestHeaders,
          body: claimBody,
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await fetch(origin + "/api/claim-guest", {
          method: "POST",
          headers: ownerHeaders,
          body: JSON.stringify({
            guestToken: signedIn.data.session!.access_token,
          }),
        })
      ).status,
      403,
    );
    const claim = await fetch(origin + "/api/claim-guest", {
      method: "POST",
      headers: ownerHeaders,
      body: claimBody,
    });
    assert.equal(claim.status, 200);
    assert.equal((await claim.json()).moved, 1);
    assert.equal(
      (
        await fetch(origin + `/api/reports/${reportId}`, {
          headers: guestHeaders,
        })
      ).status,
      404,
    );
    assert.equal(
      (
        await fetch(origin + `/api/reports/${reportId}`, {
          headers: ownerHeaders,
        })
      ).status,
      200,
    );
    const ownerAccount = await (
      await fetch(origin + "/api/account", { headers: ownerHeaders })
    ).json();
    assert.equal(ownerAccount.profile.credits, 0);
    console.log(
      "PASS: guest session, checkout guard, two-session ownership proof, report claim, private access and no duplicate free credit",
    );
  } finally {
    if (reserved) {
      const removed = await admin
        .from("guest_trial_attempts")
        .delete()
        .eq("report_id", reportId);
      assert.ifError(removed.error);
    }
    for (const id of ids) {
      const deleted = await admin.auth.admin.deleteUser(id);
      assert.ifError(deleted.error);
    }
    console.log(
      `Removed ${ids.length} temporary identities and their test data.`,
    );
  }
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : "Guest verification failed");
  process.exitCode = 1;
});
