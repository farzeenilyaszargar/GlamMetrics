// Run explicitly: node --env-file=.env.local --import tsx scripts/test-hosted.ts
// Creates temporary test identities, sends no email, and removes them on exit.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const origin = process.env.TEST_APP_URL || "http://localhost:3000";
  assert.equal(
    new URL(origin).hostname,
    "localhost",
    "Use the local app for this test",
  );
  const users: string[] = [];
  const tokens: string[] = [];
  const clients: (typeof admin)[] = [];
  async function api(path: string, index: number, method = "GET") {
    return fetch(`${origin}/api/${path}`, {
      method,
      headers: { Authorization: `Bearer ${tokens[index]}` },
    });
  }
  async function rpc(name: string, args: Record<string, unknown>) {
    const { data, error } = await admin.rpc(name, args);
    if (error) throw new Error(`${name}: ${error.code}`);
    return data;
  }
  try {
    for (let i = 0; i < 2; i++) {
      const email = `glammetrics-smoke-${randomUUID()}@example.com`;
      const password = randomUUID() + randomUUID();
      const created = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { purpose: "temporary integration test" },
      });
      assert.ifError(created.error);
      users.push(created.data.user!.id);
      const client = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      clients.push(client);
      const login = await client.auth.signInWithPassword({ email, password });
      assert.ifError(login.error);
      tokens.push(login.data.session!.access_token);
      const account = await api("account", i);
      assert.equal(account.status, 200);
      assert.equal((await account.json()).profile.credits, 1);
    }
    assert.equal((await fetch(`${origin}/api/account`)).status, 401);
    const id = randomUUID();
    const args = {
      p_user: users[0],
      p_id: id,
      p_occasion: "Hosted smoke test",
    };
    assert.equal(await rpc("reserve_report", args), "reserved");
    assert.equal(await rpc("reserve_report", args), "pending");
    assert.equal(
      await rpc("finish_report", {
        p_user: users[0],
        p_id: id,
        p_result: null,
      }),
      true,
    );
    assert.equal(
      await rpc("finish_report", {
        p_user: users[0],
        p_id: id,
        p_result: null,
      }),
      false,
    );
    assert.equal((await (await api("account", 0)).json()).profile.credits, 1);
    const savedId = randomUUID();
    assert.equal(
      await rpc("reserve_report", { ...args, p_id: savedId }),
      "reserved",
    );
    assert.equal(
      await rpc("finish_report", {
        p_user: users[0],
        p_id: savedId,
        p_result: { title: "Temporary persistence test; not an AI review" },
      }),
      true,
    );
    assert.equal((await api(`reports/${savedId}`, 0)).status, 200);
    assert.equal((await api(`reports/${savedId}`, 1)).status, 404);
    const hidden = await clients[1]
      .from("reports")
      .select("id")
      .eq("id", savedId);
    assert.ifError(hidden.error);
    assert.deepEqual(hidden.data, []);
    const denied = await clients[0].rpc("reserve_report", {
      ...args,
      p_id: randomUUID(),
    });
    assert.ok(denied.error, "Customers must not mutate credits through RPC");
    const forbidden = await clients[0]
      .from("profiles")
      .update({ credits: 999 })
      .eq("id", users[0]);
    assert.ok(forbidden.error, "Customers must not edit credits directly");
    const account = await (await api("account", 0)).json();
    assert.equal(account.profile.credits, 0);
    assert.equal(account.reports.length, 1);
    assert.equal(
      await rpc("reserve_report", { ...args, p_id: randomUUID() }),
      "empty",
    );
    const columns = await admin
      .from("reports")
      .select("credit_period_end")
      .limit(0);
    assert.ifError(columns.error);
    const payments = await admin
      .from("subscription_payments")
      .select("refunded")
      .limit(0);
    assert.ifError(payments.error);
    await rpc("revoke_refunded_payment", {
      p_payment: `nonexistent-smoke-${randomUUID()}`,
    });
    assert.equal((await api(`reports/${savedId}`, 0, "DELETE")).status, 200);
    assert.equal((await api(`reports/${savedId}`, 0)).status, 404);
    console.log(
      "PASS: hosted login, account, reservation/refund, persistence, isolation, credit protection, migration 003 and report deletion",
    );
  } finally {
    for (const id of users) {
      const { error } = await admin.auth.admin.deleteUser(id);
      if (error)
        throw new Error(
          `Temporary identity cleanup failed: ${id} (${error.code})`,
        );
    }
    console.log(
      `Removed ${users.length} temporary test identities and their profile/report data.`,
    );
  }
}
main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Hosted verification failed",
  );
  process.exitCode = 1;
});
