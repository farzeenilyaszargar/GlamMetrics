import { test } from "node:test";
import assert from "node:assert/strict";
import { newPlanSchema, reportSchema, sampleReport } from "../lib/report";
import { analyzeOutfit } from "../lib/ai-style";

test("new paid offering requires three complete looks; old saved reviews remain readable", () => {
  assert.ok(newPlanSchema.safeParse(sampleReport).success);
  const { looks, wardrobeRescue, checklist, ...legacy } = sampleReport;
  assert.ok(reportSchema.safeParse(legacy).success);
  assert.equal(newPlanSchema.safeParse(legacy).success, false);
  assert.equal(
    newPlanSchema.safeParse({ ...sampleReport, looks: looks!.slice(0, 2) })
      .success,
    false,
  );
  assert.equal(
    newPlanSchema.safeParse({ ...sampleReport, wardrobeRescue: "" }).success,
    false,
  );
  assert.equal(
    newPlanSchema.safeParse({
      ...sampleReport,
      checklist: checklist!.slice(0, 1),
    }).success,
    false,
  );
  assert.equal(
    newPlanSchema.safeParse({
      ...sampleReport,
      looks: [{ ...looks![0], shoes: "" }, ...looks!.slice(1)],
    }).success,
    false,
  );
  assert.ok(wardrobeRescue);
});

test("AI output cannot silently deliver a partial plan or a refusal as a completed review", async () => {
  const original = globalThis.fetch;
  let output: unknown = { ...sampleReport, suitable: true, reason: "" };
  let preferences: unknown;
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    preferences = JSON.parse(body.messages[1].content[0].text).styleProfile;
    return Response.json({
      choices: [{ message: { content: JSON.stringify(output) } }],
    });
  };
  const input = {
    image: "data:image/jpeg;base64,dGVzdA==",
    occasion: "Work",
    budget: "Use what I own",
    notes: "No new purchases",
    styleProfile: "Only flats and covered shoulders",
  };
  try {
    const plan = await analyzeOutfit(input);
    assert.equal(plan.looks.length, 3);
    assert.equal(preferences, input.styleProfile);
    output = {
      ...sampleReport,
      suitable: true,
      looks: sampleReport.looks!.slice(0, 2),
    };
    await assert.rejects(() => analyzeOutfit(input));
    output = { ...sampleReport, suitable: false };
    await assert.rejects(
      () => analyzeOutfit(input),
      /clear, appropriate photo/,
    );
    globalThis.fetch = async () => new Response("Unavailable", { status: 503 });
    await assert.rejects(() => analyzeOutfit(input), /credit will be returned/);
  } finally {
    globalThis.fetch = original;
  }
});
