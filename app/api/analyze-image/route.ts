import { NextResponse } from "next/server";

type AnalyzeImageBody = {
  imageDataUrl?: string;
};

type RawModelOutput = {
  summary?: string;
  faceRating?: number;
  fashionRating?: number;
  expressionScore?: number;
  overallScore?: number;
  faceShape?: string;
  styleArchetype?: string;
  strengths?: string[];
  improvements?: string[];
  recommendations?: string[];
};

export const runtime = "nodejs";

function toNumberInRange(value: unknown, min: number, max: number, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsed * 10) / 10));
}

function toStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 6);
}

function normalizeModelOutput(value: RawModelOutput) {
  return {
    summary:
      (typeof value.summary === "string" && value.summary.trim()) ||
      "Balanced look with strong visual potential for beauty and social content.",
    faceRating: toNumberInRange(value.faceRating, 1, 10, 7.2),
    fashionRating: toNumberInRange(value.fashionRating, 1, 10, 7.1),
    expressionScore: toNumberInRange(value.expressionScore, 1, 10, 7.0),
    overallScore: toNumberInRange(value.overallScore, 1, 100, 74),
    faceShape: (typeof value.faceShape === "string" && value.faceShape.trim()) || "Not enough data",
    styleArchetype:
      (typeof value.styleArchetype === "string" && value.styleArchetype.trim()) || "Clean modern",
    strengths: toStringArray(value.strengths, [
      "Balanced framing and facial proportions",
      "Clear visual identity for content",
      "Good styling baseline for experimentation",
    ]),
    improvements: toStringArray(value.improvements, [
      "Try softer directional lighting from 30-45 degrees",
      "Experiment with chin angle and camera height",
      "Use stronger color contrast in outfit selection",
    ]),
    recommendations: toStringArray(value.recommendations, [
      "Use natural window light for cleaner skin detail",
      "Try a slight 3/4 angle for stronger facial definition",
      "Prefer solid colors near the face for better focus",
    ]),
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeImageBody;
    const imageDataUrl = body.imageDataUrl?.trim();

    if (!imageDataUrl) {
      return NextResponse.json({ error: "Image is required." }, { status: 400 });
    }

    if (!imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image format." }, { status: 400 });
    }

    if (imageDataUrl.length > 8_000_000) {
      return NextResponse.json({ error: "Image is too large. Please use a smaller image." }, { status: 400 });
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is missing on the server. Add it to your environment variables." },
        { status: 500 },
      );
    }

    const model = process.env.OPENAI_VISION_MODEL || "gpt-4o-mini";

    const prompt = `
You are an image analysis assistant for a beauty and fashion app.
Analyze the person's visible presentation and return valid JSON only.
Do not include markdown.
Respond with this exact shape:
{
  "summary": "short 1-2 sentence review",
  "faceRating": number 1-10,
  "fashionRating": number 1-10,
  "expressionScore": number 1-10,
  "overallScore": number 1-100,
  "faceShape": "string",
  "styleArchetype": "string",
  "strengths": ["3 concise bullets"],
  "improvements": ["3 concise bullets"],
  "recommendations": ["3 concise practical suggestions"]
}
`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Return only strict JSON that matches the requested schema.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl,
                },
              },
            ],
          },
        ],
      }),
    });

    const aiRawText = await aiResponse.text();
    if (!aiResponse.ok) {
      let details = "Image analysis failed.";
      try {
        const parsed = JSON.parse(aiRawText) as { error?: { message?: string } };
        details = parsed.error?.message || details;
      } catch {
        details = aiRawText || details;
      }
      return NextResponse.json({ error: details }, { status: 500 });
    }

    let messageContent = "";
    try {
      const parsed = JSON.parse(aiRawText) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      messageContent = parsed.choices?.[0]?.message?.content || "";
    } catch {
      messageContent = "";
    }

    if (!messageContent) {
      return NextResponse.json({ error: "AI returned an empty analysis." }, { status: 500 });
    }

    let modelOutput: RawModelOutput = {};
    try {
      modelOutput = JSON.parse(messageContent) as RawModelOutput;
    } catch {
      return NextResponse.json({ error: "Could not parse AI analysis output." }, { status: 500 });
    }

    return NextResponse.json(normalizeModelOutput(modelOutput), { status: 200 });
  } catch (error) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Unexpected error while analyzing image." },
      { status: 500 },
    );
  }
}
