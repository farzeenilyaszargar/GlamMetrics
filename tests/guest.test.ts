import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { hasRecoverableIdentity } from "../lib/identity";

test("recurring checkout requires a verified identity, not an email typed into metadata", () => {
  assert.equal(hasRecoverableIdentity(null), false);
  assert.equal(
    hasRecoverableIdentity({
      is_anonymous: true,
      email: "verified@example.com",
      email_confirmed_at: "2026-10-15",
    }),
    false,
  );
  assert.equal(
    hasRecoverableIdentity({
      is_anonymous: false,
      email: "pending@example.com",
    }),
    false,
  );
  assert.equal(
    hasRecoverableIdentity({
      is_anonymous: false,
      email: "verified@example.com",
      email_confirmed_at: "2026-10-15",
    }),
    true,
  );
});

test("guest budget is durable and idempotent; account claims move reports without creating credits or transferring billing", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$select current_setting('request.jwt.claim.sub',true)::uuid$$; grant usage on schema auth to authenticated;",
    );
    for (const file of [
      "001_style_studio.sql",
      "002_subscriptions.sql",
      "003_billing_boundaries.sql",
      "004_guest_trials.sql",
    ])
      await db.exec(await readFile(`supabase/migrations/${file}`, "utf8"));
    const guest = crypto.randomUUID(),
      owner = crypto.randomUUID(),
      other = crypto.randomUUID();
    await db.query("insert into auth.users values($1),($2),($3)", [
      guest,
      owner,
      other,
    ]);
    const id = crypto.randomUUID();
    await assert.rejects(
      () =>
        db.query("select reserve_guest_report($1,$2,'Everyday',null)", [
          guest,
          id,
        ]),
      /Invalid daily limit/,
    );
    await assert.rejects(
      () =>
        db.query("select reserve_guest_report($1,$2,'Everyday',0)", [
          guest,
          id,
        ]),
      /Invalid daily limit/,
    );
    const reserve = async (u: string, r: string, limit = 1) =>
      (
        await db.query<{ state: string }>(
          "select reserve_guest_report($1,$2,'Everyday',$3) as state",
          [u, r, limit],
        )
      ).rows[0].state;
    assert.equal(await reserve(guest, id), "reserved");
    assert.equal(await reserve(guest, id), "pending");
    assert.equal(
      (
        await db.query<{ n: number }>(
          "select count(*)::int as n from guest_trial_attempts",
        )
      ).rows[0].n,
      1,
    );
    assert.equal(await reserve(other, crypto.randomUUID()), "guest_limited");
    assert.equal(
      (
        await db.query<{ n: number }>(
          "select count(*)::int as n from profiles where id=$1",
          [other],
        )
      ).rows[0].n,
      0,
      "budget rejection cannot create/charge a profile",
    );
    await assert.rejects(
      () => db.query("select claim_guest_reports($1,$2)", [guest, owner]),
      /processing/,
    );
    await db.query("select finish_report($1,$2,$3)", [
      guest,
      id,
      { title: "guest plan" },
    ]);
    assert.equal(
      await reserve(guest, id),
      "complete",
      "replay works even when the daily budget is used",
    );
    await db.query("insert into profiles(id,credits) values($1,1)", [owner]);
    await db.query("select claim_guest_reports($1,$2)", [guest, owner]);
    assert.equal(
      (
        await db.query<{ user_id: string }>(
          "select user_id from reports where id=$1",
          [id],
        )
      ).rows[0].user_id,
      owner,
    );
    for (const u of [guest, owner])
      assert.equal(
        (
          await db.query<{ credits: number }>(
            "select credits from profiles where id=$1",
            [u],
          )
        ).rows[0].credits,
        0,
        "claim cannot reset a free allowance",
      );
    await db.query("select claim_guest_reports($1,$2)", [guest, owner]);
    assert.equal(
      (
        await db.query<{ credits: number }>(
          "select credits from profiles where id=$1",
          [owner],
        )
      ).rows[0].credits,
      0,
    );
    await db.query(
      "update guest_trial_attempts set created_at=now()-interval '2 days'",
    );
    const second = crypto.randomUUID();
    assert.equal(await reserve(other, second), "reserved");
    await db.query("select finish_report($1,$2,null)", [other, second]);
    assert.equal(
      await reserve(other, crypto.randomUUID()),
      "guest_limited",
      "a refunded attempt still counts toward AI spend protection",
    );
    await db.query(
      "update profiles set credits=7,period_end=now()+interval '1 month' where id=$1",
      [owner],
    );
    await db.query("select claim_guest_reports($1,$2)", [other, owner]);
    assert.equal(
      (
        await db.query<{ credits: number }>(
          "select credits from profiles where id=$1",
          [owner],
        )
      ).rows[0].credits,
      7,
      "guest claim preserves paid entitlement",
    );
    await db.query(
      "insert into subscriptions(id,user_id,status) values($1,$2,'creating')",
      [crypto.randomUUID(), guest],
    );
    await assert.rejects(
      () => db.query("select claim_guest_reports($1,$2)", [guest, owner]),
      /billing/,
    );
    await db.exec("set role authenticated");
    await assert.rejects(() => db.query("select * from guest_trial_attempts"));
    await assert.rejects(() =>
      db.query("select reserve_guest_report($1,$2,'Everyday',1000)", [
        guest,
        crypto.randomUUID(),
      ]),
    );
    await assert.rejects(() =>
      db.query("select claim_guest_reports($1,$2)", [guest, owner]),
    );
  } finally {
    await db.close();
  }
});
