// Explicit real-provider smoke test. Creates one temporary identity, sends the
// project's illustrative outfit image to AI, and removes all test data afterward.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { newPlanSchema } from "../lib/report";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const origin = process.env.TEST_APP_URL || "http://localhost:3000";
  assert.equal(new URL(origin).hostname, "localhost");
  const email = `glammetrics-plan-${randomUUID()}@example.com`,
    password = randomUUID() + randomUUID();
  let userId: string | undefined;
  try {
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    assert.ifError(created.error);
    userId = created.data.user!.id;
    const client = createClient(
      url,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const login = await client.auth.signInWithPassword({ email, password });
    assert.ifError(login.error);
    const saved = await client.auth.updateUser({
      data: {
        style_preferences:
          "I prefer flats, minimal jewellery and no new purchases.",
      },
    });
    assert.ifError(saved.error);
    const verifiedUser = await client.auth.getUser();
    assert.equal(
      verifiedUser.data.user!.user_metadata.style_preferences,
      "I prefer flats, minimal jewellery and no new purchases.",
    );
    const headers = {
      Authorization: `Bearer ${login.data.session!.access_token}`,
      "Content-Type": "application/json",
    };
    const image = await readFile("public/images/editorial.png");
    const body = JSON.stringify({
      id: randomUUID(),
      image: `data:image/png;base64,${image.toString("base64")}`,
      occasion: "Wedding guest",
      budget: "Use what I own",
      notes: "I own gold flats and small gold earrings.",
      consent: true,
    });
    const response = await fetch(`${origin}/api/analyze-image`, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(90000),
    });
    if (!response.ok)
      throw new Error(
        `Plan endpoint failed (${response.status}): ${(await response.json()).error}`,
      );
    const data = await response.json();
    const result = newPlanSchema.parse(data.result);
    const retrieved = await fetch(`${origin}/api/reports/${data.id}`, {
      headers,
    });
    assert.equal(retrieved.status, 200);
    assert.deepEqual((await retrieved.json()).result, data.result);
    const replay = await fetch(`${origin}/api/analyze-image`, {
      method: "POST",
      headers,
      body,
    });
    assert.equal(replay.status, 200);
    assert.equal((await replay.json()).id, data.id);
    const account = await fetch(`${origin}/api/account`, { headers });
    const accountData = await account.json();
    assert.equal(accountData.profile.credits, 0);
    assert.equal(accountData.reports.length, 1);
    console.log(
      JSON.stringify({
        passed: true,
        styledLooks: result.looks.length,
        checklistItems: result.checklist.length,
        wardrobeFirstVersion: !!result.wardrobeRescue,
        savedPreferences: true,
        persistedReport: true,
        retryChargedOnce: true,
      }),
    );
  } finally {
    if (userId) {
      const deleted = await admin.auth.admin.deleteUser(userId);
      assert.ifError(deleted.error);
      console.log("Temporary identity and its plan data removed.");
    }
  }
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : "Plan verification failed");
  process.exitCode = 1;
});
