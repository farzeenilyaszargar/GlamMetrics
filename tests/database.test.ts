import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
test("database enforces owner isolation, review limits, refunds and idempotent recurring entitlements", async () => {
  const db = new PGlite();
  await db.exec(
    `create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select current_setting('request.jwt.claim.sub',true)::uuid $$; grant usage on schema auth to authenticated;`,
  );
  for (const file of [
    "001_style_studio.sql",
    "002_subscriptions.sql",
    "003_billing_boundaries.sql",
  ])
    await db.exec(await readFile(`supabase/migrations/${file}`, "utf8"));
  const user = "00000000-0000-4000-8000-000000000001",
    other = "00000000-0000-4000-8000-000000000002";
  await db.query("insert into auth.users values($1),($2)", [user, other]);
  const reserve = async (id: string, owner = user) =>
    (
      await db.query<{ reserve_report: string }>(
        "select reserve_report($1,$2,$3)",
        [owner, id, "Everyday"],
      )
    ).rows[0].reserve_report;
  const finish = async (id: string, result: unknown) =>
    (await db.query("select finish_report($1,$2,$3)", [user, id, result]))
      .rows[0];
  const balance = async () =>
    (
      await db.query<{ credits: number }>(
        "select credits from profiles where id=$1",
        [user],
      )
    ).rows[0].credits;
  const first = crypto.randomUUID();
  assert.equal(await reserve(first), "reserved");
  assert.equal(await balance(), 0);
  assert.equal(await reserve(first), "pending");
  assert.equal(await reserve(crypto.randomUUID()), "busy");
  await assert.rejects(() => reserve(first, other));
  await finish(first, null);
  await finish(first, null);
  assert.equal(await balance(), 1, "failed analysis refunds exactly once");
  const second = crypto.randomUUID();
  await reserve(second);
  await finish(second, { title: "test" });
  assert.equal(await balance(), 0);
  assert.equal(await reserve(second), "complete");
  assert.equal(await reserve(crypto.randomUUID()), "empty");
  await db.query(
    "insert into subscriptions(id,user_id,provider_id,status) values($1,$2,$3,$4)",
    [crypto.randomUUID(), user, "sub_test", "active"],
  );
  const now = new Date(),
    end = new Date(Date.now() + 30 * 86400000);
  const credit = async (payment: string, start = now, until = end) =>
    (
      await db.query("select credit_subscription($1,$2,$3,$4,$5)", [
        "sub_test",
        payment,
        9900,
        start,
        until,
      ])
    ).rows[0];
  await credit("pay_one");
  assert.equal(await balance(), 10);
  const third = crypto.randomUUID();
  await reserve(third);
  await finish(third, {});
  assert.equal(await balance(), 9);
  await credit("pay_one");
  await credit("pay_duplicate_same_period");
  assert.equal(await balance(), 9, "same payment or period cannot grant again");
  await assert.rejects(() =>
    db.query("select credit_subscription($1,$2,$3,$4,$5)", [
      "sub_test",
      "pay_wrong",
      1,
      now,
      end,
    ]),
  );
  await credit(
    "pay_old",
    new Date(Date.now() - 60 * 86400000),
    new Date(Date.now() - 30 * 86400000),
  );
  assert.equal(
    await balance(),
    9,
    "late events cannot overwrite current credits",
  );
  const stale = crypto.randomUUID();
  await reserve(stale);
  await db.query(
    "update reports set created_at=now()-interval '6 minutes' where id=$1",
    [stale],
  );
  await reserve(crypto.randomUUID());
  assert.equal(
    await balance(),
    8,
    "one stale credit restored then one reserved",
  );
  await db.exec(
    `set role authenticated; set request.jwt.claim.sub='${other}';`,
  );
  assert.equal((await db.query("select * from reports")).rows.length, 0);
  await assert.rejects(() => db.query("update profiles set credits=500"));
  await assert.rejects(() =>
    db.query("select credit_subscription($1,$2,$3,$4,$5)", [
      "sub_test",
      "forged",
      9900,
      now,
      end,
    ]),
  );
  await db.exec("reset role");
  const pending = (
    await db.query<{ id: string }>(
      "select id from reports where status='pending'",
    )
  ).rows[0].id;
  const nextEnd = new Date(end.getTime() + 30 * 86400000);
  await credit("pay_renewal", end, nextEnd);
  assert.equal(await balance(), 10);
  await finish(pending, null);
  assert.equal(
    await balance(),
    10,
    "a previous-cycle failure cannot inflate renewed credits",
  );
  await db.query("select revoke_refunded_payment($1)", ["pay_one"]);
  assert.equal(
    await balance(),
    10,
    "refunding an old cycle does not erase current credits",
  );
  await db.query("select revoke_refunded_payment($1)", ["pay_renewal"]);
  assert.equal(await balance(), 0);
  await credit("pay_renewal", end, nextEnd);
  assert.equal(
    await balance(),
    0,
    "refunded payments cannot be replayed for credits",
  );
  await db.query(
    "update profiles set period_end=now()-interval '1 minute' where id=$1",
    [user],
  );
  await db.query("update reports set status='failed' where status='pending'");
  assert.equal(
    await reserve(crypto.randomUUID()),
    "empty",
    "expired membership cannot consume reviews",
  );
  await db.close();
});
