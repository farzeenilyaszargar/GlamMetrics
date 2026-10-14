import { readFile } from "node:fs/promises";
import { analyzeOutfit } from "../lib/ai-style";
async function main() {
  const image = await readFile("public/images/editorial.png");
  const result = await analyzeOutfit({
    image: `data:image/png;base64,${image.toString("base64")}`,
    occasion: "Wedding guest",
    budget: "Use what I own",
    notes: "Minimal jewellery, no new purchases.",
    singleLook: process.env.TEST_SINGLE_LOOK === "true",
  });
  console.log(
    JSON.stringify({
      valid: true,
      title: result.title,
      score: result.score,
      strengths: result.strengths.length,
      suggestions: result.suggestions.length,
      palette: result.palette.length,
      styledLooks: result.looks.length,
      checklist: result.checklist.length,
      wardrobeFirst: !!result.wardrobeRescue,
    }),
  );
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
