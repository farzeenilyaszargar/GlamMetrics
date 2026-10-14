import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { outfitFixSchema, reportSchema, sampleReport } from "../lib/report";
import { analyzeOutfit } from "../lib/ai-style";
import { signatureValid } from "../lib/payments";
import { createHmac } from "node:crypto";
import { confirmOutfitPayment } from "../lib/outfit-payments";

test("provider verification rejects authorised-only payments, wrong amounts and wrong orders before fulfillment", async () => {
  const original = globalThis.fetch;
  let payment = {
    id: "pay_test",
    order_id: "order_test",
    amount: 9900,
    currency: "INR",
    status: "authorized",
  };
  const oldId = process.env.RAZORPAY_KEY_ID,
    oldSecret = process.env.RAZORPAY_KEY_SECRET;
  process.env.RAZORPAY_KEY_ID = "test";
  process.env.RAZORPAY_KEY_SECRET = "test";
  globalThis.fetch = async () => Response.json(payment);
  try {
    await assert.rejects(
      () => confirmOutfitPayment("pay_test", "order_test"),
      /awaiting capture/,
    );
    payment = { ...payment, status: "captured", amount: 1 };
    await assert.rejects(
      () => confirmOutfitPayment("pay_test", "order_test"),
      /does not match/,
    );
    payment = { ...payment, amount: 9900 };
    await assert.rejects(
      () => confirmOutfitPayment("pay_test", "order_other"),
      /different order/,
    );
  } finally {
    globalThis.fetch = original;
    if (oldId === undefined) delete process.env.RAZORPAY_KEY_ID;
    else process.env.RAZORPAY_KEY_ID = oldId;
    if (oldSecret === undefined) delete process.env.RAZORPAY_KEY_SECRET;
    else process.env.RAZORPAY_KEY_SECRET = oldSecret;
  }
});

test("one-off deliverable is exactly one complete look and three specific changes", async () => {
  const fix = { ...sampleReport, looks: sampleReport.looks!.slice(0, 1) };
  assert.ok(outfitFixSchema.safeParse(fix).success);
  assert.ok(reportSchema.safeParse(fix).success);
  assert.equal(outfitFixSchema.safeParse(sampleReport).success, false);
  assert.equal(
    outfitFixSchema.safeParse({ ...fix, suggestions: ["one"] }).success,
    false,
  );
  const original = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    const request = JSON.parse(String(init?.body));
    assert.equal(
      request.response_format.json_schema.schema.properties.looks.maxItems,
      1,
    );
    return Response.json({
      choices: [
        {
          message: {
            content: JSON.stringify({ ...fix, suitable: true, reason: "" }),
          },
        },
      ],
    });
  };
  try {
    const result = await analyzeOutfit({
      image: "data:image/jpeg;base64,dGVzdA==",
      occasion: "Work",
      notes: "Flats only",
      budget: "Use what I own",
      singleLook: true,
    });
    assert.equal(result.looks.length, 1);
    assert.deepEqual(result.shopping, []);
  } finally {
    globalThis.fetch = original;
  }
});

test("checkout signatures bind the original server order and payment", () => {
  const signature = createHmac("sha256", "testsecret")
    .update("order_123|pay_123")
    .digest("hex");
  assert.ok(signatureValid("order_123|pay_123", signature, "testsecret"));
  assert.equal(
    signatureValid("order_other|pay_123", signature, "testsecret"),
    false,
  );
});

test("paid purchases are isolated, idempotent, retryable, fenced and revoked by refunds", async () => {
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
      "005_outfit_fix.sql",
    ])
      await db.exec(await readFile(`supabase/migrations/${file}`, "utf8"));
    const owner = crypto.randomUUID(),
      other = crypto.randomUUID(),
      id = crypto.randomUUID();
    await db.query("insert into auth.users values($1),($2);", [owner, other]);
    await db.query("insert into profiles(id) values($1),($2)", [owner, other]);
    await db.query(
      "insert into outfit_purchases(id,user_id,provider_order_id,status) values($1,$2,'order_123','created')",
      [id, owner],
    );
    const reserve = async (u = owner) =>
      (
        await db.query<{ n: number }>(
          "select reserve_outfit_fix($1,$2,'Work') n",
          [u, id],
        )
      ).rows[0].n;
    const finish = async (attempt: number, result: unknown) =>
      (
        await db.query<{ ok: boolean }>(
          "select finish_outfit_fix($1,$2,$3,$4::jsonb) ok",
          [owner, id, attempt, result === null ? null : JSON.stringify(result)],
        )
      ).rows[0].ok;
    assert.equal(await reserve(), -1);
    await assert.rejects(() => reserve(other), /Unknown purchase/);
    await assert.rejects(
      () => db.query("select pay_outfit_fix('order_123','pay_123',1,'INR')"),
      /Payment mismatch/,
    );
    await db.exec(
      "select pay_outfit_fix('order_123','pay_123',9900,'INR'); select pay_outfit_fix('order_123','pay_123',9900,'INR');",
    );
    await assert.rejects(
      () => db.exec("select pay_outfit_fix('order_123','pay_123',null,'INR')"),
      /Payment mismatch/,
    );
    await assert.rejects(
      () => db.exec("select pay_outfit_fix('order_123','pay_123',9900,'USD')"),
      /Payment mismatch/,
    );
    await assert.rejects(
      () =>
        db.exec("select pay_outfit_fix('order_123','pay_other',9900,'INR')"),
      /Payment mismatch/,
    );
    assert.equal(await reserve(), 1);
    assert.equal(await reserve(), -2);
    assert.equal(await finish(1, null), true);
    assert.equal(await reserve(), 2);
    assert.equal(await finish(1, { late: true }), false);
    assert.equal(await finish(2, { done: true }), true);
    assert.equal(await reserve(), 0);
    assert.equal(
      (
        await db.query<{ credits: number }>(
          "select credits from profiles where id=$1",
          [owner],
        )
      ).rows[0].credits,
      1,
    );
    await db.exec(
      "select pay_outfit_fix('order_123','pay_123',9900,'INR',true); select pay_outfit_fix('order_123','pay_123',9900,'INR');",
    );
    assert.equal(await reserve(), -1);
    assert.equal(
      (
        await db.query<{ status: string }>(
          "select status from outfit_purchases",
        )
      ).rows[0].status,
      "refunded",
    );
    const second = crypto.randomUUID();
    await db.query(
      "insert into outfit_purchases(id,user_id,status) values($1,$2,'paid')",
      [second, owner],
    );
    for (let i = 1; i <= 5; i++) {
      assert.equal(
        (
          await db.query<{ n: number }>(
            "select reserve_outfit_fix($1,$2,'Work') n",
            [owner, second],
          )
        ).rows[0].n,
        i,
      );
      if (i === 1)
        await assert.rejects(
          () => db.query("select claim_guest_reports($1,$2)", [owner, other]),
          /still processing/,
        );
      await db.query("select finish_outfit_fix($1,$2,$3,null)", [
        owner,
        second,
        i,
      ]);
    }
    assert.equal(
      (
        await db.query<{ n: number }>(
          "select reserve_outfit_fix($1,$2,'Work') n",
          [owner, second],
        )
      ).rows[0].n,
      -3,
    );
    await db.query("select claim_guest_reports($1,$2)", [owner, other]);
    assert.equal(
      (
        await db.query<{ user_id: string }>(
          "select user_id from outfit_purchases where id=$1",
          [second],
        )
      ).rows[0].user_id,
      other,
    );
    await assert.rejects(() => reserve(owner), /Unknown purchase/);
    await db.exec("set role authenticated");
    await assert.rejects(
      () => db.exec("select pay_outfit_fix('order_123','pay_123',9900,'INR')"),
      /permission denied/,
    );
    await assert.rejects(
      () => db.exec("update outfit_purchases set status='paid'"),
      /permission denied/,
    );
    assert.equal(
      (await db.query("select * from outfit_purchases")).rows.length,
      0,
    );
  } finally {
    await db.close();
  }
});
