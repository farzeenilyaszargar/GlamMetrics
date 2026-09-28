"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { readDraft, writeDraft } from "@/lib/draft";
import {
  Camera,
  Upload,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  X,
  LoaderCircle,
} from "lucide-react";
import { useSession } from "@/components/session";
import { api, ClientApiError } from "@/lib/supabase";
import { occasions } from "@/lib/catalog";
import Report from "@/components/style-report";
import type { StyleReport } from "@/lib/report";
export default function Studio({
  initialOccasion = "Everyday",
}: {
  initialOccasion?: string;
}) {
  const router = useRouter();
  const { user, loading } = useSession();
  const [image, setImage] = useState("");
  const [occasion, setOccasion] = useState<string>(initialOccasion);
  const [budget, setBudget] = useState("Use what I own");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<StyleReport | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const requestId = useRef<string | null>(null);
  useEffect(() => {
    readDraft()
      .then((d) => {
        if (d) {
          setImage(d.image);
          setOccasion(d.occasion);
          setBudget(d.budget);
          setNotes(d.notes);
        }
      })
      .catch(() => {});
  }, []);
  async function signIn() {
    try {
      if (image)
        await writeDraft({
          image,
          occasion,
          budget,
          notes,
          savedAt: Date.now(),
        });
      router.push("/auth?next=/analysis");
    } catch {
      setError(
        "Your browser couldn't keep this photo during sign-in. Please sign in using Account, then choose the photo again.",
      );
    }
  }
  useEffect(() => {
    if (user)
      api("/api/account")
        .then((d) => setCredits(d.profile.credits))
        .catch(() => {});
  }, [user, result]);
  async function select(file?: File) {
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError(
        "Choose a JPG, PNG or WebP photo. Convert HEIC photos to JPG first.",
      );
      return;
    }
    if (file.size > 15000000) {
      setError("Choose a photo under 15 MB.");
      return;
    }
    setProcessing(true);
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error();
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      setImage(canvas.toDataURL("image/jpeg", 0.85));
      setResult(null);
      requestId.current = null;
    } catch {
      setError("That photo couldn't be opened. Please try another.");
    } finally {
      setProcessing(false);
    }
  }
  async function analyze(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !image) return;
    setBusy(true);
    setError("");
    requestId.current ??= crypto.randomUUID();
    try {
      const data = await api("/api/analyze-image", {
        method: "POST",
        body: JSON.stringify({
          id: requestId.current,
          image,
          occasion,
          budget,
          notes,
          consent,
        }),
      });
      setResult(data.result);
      setImage("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
      if (e instanceof ClientApiError && e.status !== 429)
        requestId.current = null;
    } finally {
      setBusy(false);
    }
  }
  if (result)
    return (
      <main id="main" className="wrap page-space">
        <Report
          report={result}
          occasion={occasion}
          onNewReview={() => {
            setResult(null);
            requestId.current = null;
          }}
        />
      </main>
    );
  return (
    <main id="main" className="wrap page-space studio">
      <div className="page-heading">
        <span className="eyebrow">
          <Sparkles size={15} /> THE STYLE STUDIO
        </span>
        <h1>
          Let’s find your
          <br />
          <em>feel-good look.</em>
        </h1>
        <p>A mirror selfie. An occasion. A fresh perspective.</p>
      </div>
      <form className="studio-grid" onSubmit={analyze}>
        <section>
          <div
            className={`upload-zone ${image ? "has-image" : ""}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (!busy) void select(e.dataTransfer.files[0]);
            }}
          >
            {image ? (
              <>
                <Image
                  src={image}
                  alt="Your selected outfit, ready for review"
                  width={1400}
                  height={1400}
                  unoptimized
                />
                <button
                  type="button"
                  className="remove-image icon-button"
                  aria-label="Remove selected photo"
                  disabled={busy}
                  onClick={() => setImage("")}
                >
                  <X size={18} />
                </button>
                <span className="image-label">YOUR LOOK, YOUR WAY</span>
              </>
            ) : (
              <>
                <div className="upload-ornament">
                  <Camera size={32} strokeWidth={1} />
                </div>
                <h2>
                  Your next great look
                  <br />
                  <em>starts here.</em>
                </h2>
                <p>
                  Drop your outfit photo here
                  <br />
                  or choose one from your gallery.
                </p>
                <button
                  type="button"
                  className="button primary"
                  disabled={processing || busy}
                  onClick={() => input.current?.click()}
                >
                  {processing ? (
                    <LoaderCircle className="spin" size={18} />
                  ) : (
                    <Upload size={17} />
                  )}{" "}
                  Choose a photo
                </button>
                <button
                  type="button"
                  className="text-link"
                  disabled={processing || busy}
                  onClick={() => camera.current?.click()}
                >
                  <Camera size={16} /> Take a photo
                </button>
                <small>JPG, PNG or WebP · Up to 15 MB</small>
              </>
            )}
          </div>
          <input
            ref={input}
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              void select(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <input
            ref={camera}
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={(e) => {
              void select(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <div className="photo-tip">
            <ShieldCheck size={19} />
            <p>
              Your original photo isn’t saved by GlamMetrics. Only your written
              style edit lives in your account.
            </p>
          </div>
          <Link href="/sample" className="text-link">
            Just looking? Explore an example report <ArrowRight size={15} />
          </Link>
        </section>
        <section className="studio-settings">
          <div className="setting-title">
            <span>01</span>
            <h3>What’s the occasion?</h3>
          </div>
          <div className="chips">
            {occasions.map((o) => (
              <button
                key={o}
                type="button"
                aria-pressed={occasion === o}
                disabled={busy}
                className={occasion === o ? "selected" : ""}
                onClick={() => setOccasion(o)}
              >
                {o}
              </button>
            ))}
          </div>
          <div className="setting-title">
            <span>02</span>
            <h3>Your styling budget</h3>
          </div>
          <label className="sr-only" htmlFor="budget">
            Styling budget
          </label>
          <select
            id="budget"
            disabled={busy}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          >
            {[
              "Use what I own",
              "Under ₹1,000",
              "₹1,000–₹3,000",
              "₹3,000–₹5,000",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <div className="setting-title">
            <span>03</span>
            <h3>
              A little about your style <small>optional</small>
            </h3>
          </div>
          <label className="sr-only" htmlFor="notes">
            Style preferences
          </label>
          <textarea
            id="notes"
            disabled={busy}
            placeholder="Love minimal jewellery? Prefer flats? Tell us what feels like you…"
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <small className="counter">{notes.length}/500</small>
          <label className="consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
              disabled={busy}
            />
            <span>
              I’m 18+, have permission to use this photo, and agree to its AI
              processing as described in the{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </span>
          </label>
          {user ? (
            <>
              <button
                className="button primary full"
                disabled={
                  !image || !consent || busy || processing || credits === 0
                }
              >
                {busy ? (
                  <>
                    <LoaderCircle className="spin" size={18} /> Considering your
                    look…
                  </>
                ) : (
                  <>
                    Create my style edit <Sparkles size={18} />
                  </>
                )}
              </button>
              <p className="fineprint center">
                {credits === null
                  ? "Uses one style review."
                  : `${credits} ${credits === 1 ? "review" : "reviews"} available · Uses one review`}
              </p>
              {credits === 0 && (
                <Link className="text-link" href="/pricing">
                  Join the Style Circle for ₹99/month →
                </Link>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                className="button primary full"
                onClick={signIn}
                disabled={loading}
              >
                {loading
                  ? "Getting your studio ready…"
                  : "Sign in for your free review"}
                <ArrowRight size={18} />
              </button>
              <p className="fineprint center">
                One complimentary review. No payment details needed.
              </p>
            </>
          )}
          {busy && (
            <p className="notice" role="status">
              We’re looking at colour, coordination and those little finishing
              touches. This can take about a minute. Keep this page open.
            </p>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </section>
      </form>
    </main>
  );
}
