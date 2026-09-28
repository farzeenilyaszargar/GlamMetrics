import { z } from "zod";
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
    .min(1)
    .max(4),
  cameraTip: z.string().max(600),
});
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
};
