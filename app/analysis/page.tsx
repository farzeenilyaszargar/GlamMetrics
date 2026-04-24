"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import {
  clearPendingAnalysisImage,
  getPendingAnalysisImage,
  getPendingAnalysisSource,
  setPendingAnalysisImage,
} from "@/lib/analysis-session";
import { auth } from "@/lib/firebase";
import { addUserHistory } from "@/lib/user-profile-store";

type AnalysisResult = {
  summary: string;
  faceRating: number;
  fashionRating: number;
  expressionScore: number;
  overallScore: number;
  faceShape: string;
  styleArchetype: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
};

function ScoreCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[#ED2738]/15 bg-[#fff7f9] p-4">
      <p className="text-xs text-black/55">{label}</p>
      <p className="mt-1 text-xl font-semibold text-black">{value}</p>
    </div>
  );
}

function BulletList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <p className="text-sm font-semibold text-black">{title}</p>
      <ul className="mt-2 space-y-1">
        {items.map((item) => (
          <li key={item} className="text-sm text-black/75">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AnalysisPage() {
  const router = useRouter();
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [source, setSource] = useState<"camera" | "upload" | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const pendingImage = getPendingAnalysisImage();
    const pendingSource = getPendingAnalysisSource();
    setImageDataUrl(pendingImage);
    setSource(pendingSource);
  }, []);

  useEffect(() => {
    if (!imageDataUrl) return;

    let cancelled = false;
    const runAnalysis = async () => {
      setIsAnalyzing(true);
      setError(null);
      setResult(null);

      try {
        const response = await fetch("/api/analyze-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageDataUrl,
          }),
        });

        const data = (await response.json()) as AnalysisResult & { error?: string };
        if (!response.ok) {
          throw new Error(data.error || "Could not analyze image.");
        }

        if (cancelled) return;
        setResult(data);
        setError(null);
        if (auth?.currentUser) {
          addUserHistory(
            auth.currentUser.uid,
            `Completed AI Analysis (${source === "camera" ? "Camera" : "Upload"})`,
          );
        }
      } catch (analysisError) {
        const nextError =
          analysisError instanceof Error
            ? analysisError.message
            : "Analysis failed. Please try with a clearer image.";
        if (!cancelled) setError(nextError);
      } finally {
        if (!cancelled) setIsAnalyzing(false);
      }
    };

    void runAnalysis();
    return () => {
      cancelled = true;
    };
  }, [imageDataUrl, source]);

  const uploadAnotherPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imageBitmap = await createImageBitmap(file);
      const maxWidth = 1400;
      const ratio = Math.min(1, maxWidth / imageBitmap.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(imageBitmap.width * ratio);
      canvas.height = Math.round(imageBitmap.height * ratio);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not process image");
      ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
      imageBitmap.close();

      const nextDataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setPendingAnalysisImage(nextDataUrl, "upload");
      setImageDataUrl(nextDataUrl);
      setSource("upload");
      setResult(null);
    } catch {
      setError("Could not load this image. Please try another photo.");
    } finally {
      event.target.value = "";
    }
  };

  const clearAndReturnHome = () => {
    clearPendingAnalysisImage();
    router.push("/");
  };

  return (
    <main className="flex min-h-screen w-full flex-col bg-[#FBD4D7] pt-24">
      <Navbar />

      <section className="w-full flex-1 px-4 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl border border-[#ED2738]/15 bg-white p-4 shadow-[0_14px_38px_rgba(15,23,42,0.08)] sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 max-sm:items-start">
              <h1 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">Your Analysis</h1>
              <div className="flex gap-2 max-sm:w-full max-sm:flex-col">
                <button
                  type="button"
                  onClick={() => uploadInputRef.current?.click()}
                  className="rounded-full border border-[#ED2738] bg-[#ED2738] px-4 py-2 text-sm font-medium text-white hover:bg-[#c61f2f] max-sm:w-full"
                >
                  Upload another
                </button>
                <button
                  type="button"
                  onClick={clearAndReturnHome}
                  className="rounded-full border border-black/20 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-[#F7DBE2] max-sm:w-full"
                >
                  Back home
                </button>
              </div>
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={uploadAnotherPhoto}
              />
            </div>

            {imageDataUrl ? (
              <div className="overflow-hidden rounded-xl border border-[#ED2738]/25 bg-[#fff7f9] p-2">
                <img src={imageDataUrl} alt="Analysis input" className="h-auto w-full rounded-lg object-cover" />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-black/25 p-8 text-center">
                <p className="text-sm text-black/70">No image found. Start from Take Photo or Upload Photo in hero.</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.08)] sm:p-6">
            {isAnalyzing ? (
              <div className="space-y-3">
                <p className="text-lg font-semibold text-black">Analyzing your image...</p>
                <p className="text-sm text-black/70">
                  AI is reviewing face details, style, expression, and confidence signals.
                </p>
              </div>
            ) : error ? (
              <div className="space-y-3">
                <p className="text-lg font-semibold text-[#b42318]">Analysis error</p>
                <p className="text-sm text-black/75">{error}</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.06em] text-black/50">AI review</p>
                  <p className="mt-2 text-base leading-relaxed text-black/80">{result.summary}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <ScoreCard label="Face Rating" value={`${result.faceRating}/10`} />
                  <ScoreCard label="Fashion Rating" value={`${result.fashionRating}/10`} />
                  <ScoreCard label="Expression Score" value={`${result.expressionScore}/10`} />
                  <ScoreCard label="Overall Score" value={`${result.overallScore}/100`} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <ScoreCard label="Face Shape" value={result.faceShape} />
                  <ScoreCard label="Style Archetype" value={result.styleArchetype} />
                </div>

                <BulletList title="Strengths" items={result.strengths} />
                <BulletList title="Improvements" items={result.improvements} />
                <BulletList title="Recommendations" items={result.recommendations} />
              </div>
            ) : (
              <p className="text-sm text-black/70">Upload or capture a photo to start analysis.</p>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
