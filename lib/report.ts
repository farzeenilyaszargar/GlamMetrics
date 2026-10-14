import { z } from "zod";
export const lookSchema = z.object({
  name: z.string().min(1).max(80),
  outfit: z.string().min(1).max(500),
  shoes: z.string().min(1).max(200),
  accessories: z.string().min(1).max(300),
  finishingTouch: z.string().min(1).max(300),
  why: z.string().min(1).max(400),
});
const planFields = {
  looks: z.array(lookSchema).length(3),
  wardrobeRescue: z.string().min(1).max(800),
  checklist: z.array(z.string().min(1).max(250)).min(3).max(6),
};
export const reportSchema = z.object({
  title: z.string().min(1).max(100),
  summary: z.string().min(1).max(1200),
  score: z.number().int().min(1).max(100),
  scores: z.object({
    coordination: z.number().int().min(1).max(100),
    occasion: z.number().int().min(1).max(100),
    details: z.number().int().min(1).max(100),
  }),
  strengths: z.array(z.string().max(500)).min(1).max(5),
  suggestions: z.array(z.string().max(500)).min(1).max(5),
  palette: z
    .array(
      z.object({
        name: z.string().max(60),
        hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      }),
    )
    .min(3)
    .max(5),
  shopping: z
    .array(
      z.object({
        item: z.string().max(150),
        reason: z.string().max(500),
        budget: z.string().max(80),
      }),
    )
    .min(0)
    .max(4),
  cameraTip: z.string().max(600),
  // Optional only for reports saved before the styling-plan upgrade.
  looks: planFields.looks.optional(),
  wardrobeRescue: planFields.wardrobeRescue.optional(),
  checklist: planFields.checklist.optional(),
});
export const newPlanSchema = reportSchema.extend(planFields);
export type StyleReport = z.infer<typeof reportSchema>;
export const sampleReport: StyleReport = {
  title: "A little rose. A lot of presence.",
  summary:
    "The tonal rose drape and warm gold details create a beautifully cohesive wedding-guest look. Keep the finishing touches delicate and let the silk do the talking.",
  score: 89,
  scores: { coordination: 94, occasion: 91, details: 83 },
  strengths: [
    "The rose-and-gold pairing feels warm and intentional.",
    "A fluid drape balances the clean lines of the blouse.",
    "The embellished mini bag adds just enough occasion sparkle.",
  ],
  suggestions: [
    "Choose one statement detail: keep the neckline clean with these earrings.",
    "Try understated gold sandals to continue the warm palette.",
    "Pin the pleats securely so the drape stays effortless through the evening.",
  ],
  palette: [
    { name: "Dusty rose", hex: "#BE8F87" },
    { name: "Champagne", hex: "#D9C4A2" },
    { name: "Ivory", hex: "#F2EBDF" },
    { name: "Deep plum", hex: "#643449" },
  ],
  shopping: [
    {
      item: "Minimal gold sandals",
      reason: "A quiet finish that complements the jewellery.",
      budget: "Suggested budget: ₹800–₹1,500",
    },
    {
      item: "A delicate gold cuff",
      reason: "An optional finishing touch; use one you already own first.",
      budget: "Suggested budget: ₹300–₹700",
    },
  ],
  cameraTip:
    "Stand near soft window light, turn slightly, and leave space in the frame to show the full drape. Avoid direct flash on the silk.",
  looks: [
    {
      name: "The wedding guest",
      outfit:
        "Keep the rose saree and matching blouse. Secure the shoulder pleats for a clean, easy drape.",
      shoes: "Gold flats or low block heels you already own.",
      accessories:
        "Gold earrings and the embellished bag. Skip a necklace so the earrings can lead.",
      finishingTouch: "A low bun with a soft side part.",
      why: "Keeps the warm rose-and-gold palette together and leaves the silk as the focus.",
    },
    {
      name: "The understated dinner",
      outfit:
        "Use the same saree, with a loosely draped pallu pinned discreetly at the shoulder.",
      shoes: "Simple neutral sandals, if available in your wardrobe.",
      accessories:
        "Swap to small studs and a plain clutch. Leave the statement bag at home.",
      finishingTouch: "Wear your hair down and keep other accessories minimal.",
      why: "A few quieter details make the same outfit feel appropriate for a smaller evening.",
    },
    {
      name: "The festive afternoon",
      outfit:
        "Neatly pleat the same rose saree so it stays comfortable as you move.",
      shoes: "Comfortable flats; a gold or tan pair would work.",
      accessories:
        "One slim bangle and small earrings. Use a compact bag that leaves your hands free.",
      finishingTouch:
        "A comfortable ponytail or braid, with secure pins for the pallu.",
      why: "Less jewellery and practical footwear keep it relaxed without losing the occasion feel.",
    },
  ],
  wardrobeRescue:
    "Keep your current saree, blouse, earrings and bag. Skip extra jewellery, pin the pleats, and use your most comfortable neutral or gold shoes. Nothing new is necessary for this version.",
  checklist: [
    "Secure the pallu and pleats before leaving.",
    "Choose earrings or a necklace as the focal point, rather than both.",
    "Check the shoe comfort with a short walk.",
    "Pack safety pins in your bag.",
  ],
};
