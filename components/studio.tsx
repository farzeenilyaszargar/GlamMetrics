"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { ArrowRight, Camera, Check, LoaderCircle, Upload } from "lucide-react";
import { api } from "@/lib/supabase";
import { ensureGuestSession } from "@/lib/guest-session";
import { readDraft, writeDraft } from "@/lib/draft";
import { occasions } from "@/lib/catalog";
import type { StyleReport } from "@/lib/report";
import Report from "./style-report";

type Reply = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};
declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      order_id: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      prefill: { email: string };
      theme: { color: string };
      modal: { ondismiss: () => void };
      handler: (reply: Reply) => Promise<void>;
    }) => {
      open: () => void;
      on: (event: string, callback: () => void) => void;
    };
  }
}
export default function Studio({
  initialOccasion = "Everyday",
}: {
  initialOccasion?: string;
}) {
  const [image, setImage] = useState("");
  const [occasion, setOccasion] = useState(initialOccasion);
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [id, setId] = useState("");
  const [paid, setPaid] = useState(false);
  const [result, setResult] = useState<StyleReport | null>(null);
  const upload = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  useEffect(() => {
    readDraft()
      .then((d) => {
        if (d) {
          setImage(d.image);
          setOccasion(d.occasion);
          setNotes(d.notes);
          setId(d.purchaseId || "");
        }
        const resume = new URLSearchParams(window.location.search).get(
          "purchase",
        );
        if (resume && /^[a-f0-9-]{36}$/i.test(resume)) setId(resume);
      })
      .catch(() =>
        setError(
          "This browser can't save your draft. Please use a browser with storage enabled before paying.",
        ),
      );
  }, []);
  async function select(file?: File) {
    if (!file) return;
    setError("");
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 15_000_000
    ) {
      setError(
        "Choose a JPG, PNG or WebP under 15 MB. Convert HEIC to JPG first.",
      );
      return;
    }
    setBusy("Preparing photo…");
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
    } catch {
      setError("Couldn't open that photo. Try another.");
    } finally {
      setBusy("");
    }
  }
  async function generate(purchaseId: string) {
    setBusy("Styling your outfit… Please keep this page open.");
    const data = await api("/api/outfit-fix/generate", {
      method: "POST",
      body: JSON.stringify({ id: purchaseId, image, occasion, notes, consent }),
    });
    setResult(data.result);
    setOccasion(data.occasion);
    await writeDraft(null).catch(() => {});
    setImage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function checkPayment() {
    setBusy("Checking your purchase…");
    setError("");
    try {
      await ensureGuestSession();
      const data = await api(`/api/outfit-fix/order?id=${id}`);
      setPaid(data.status === "paid");
      if (data.result) {
        setResult(data.result);
        setOccasion(data.occasion);
        await writeDraft(null).catch(() => {});
      } else if (data.status === "refunded")
        setError(
          "This purchase was refunded. Contact support if you need help.",
        );
      else
        setError(
          data.status === "paid"
            ? "Payment confirmed. Your Outfit Fix is ready to generate below—no additional payment."
            : "No captured payment yet. If money was debited, wait and check again before retrying checkout.",
        );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not check payment.");
    } finally {
      setBusy("");
    }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!image || !consent || busy) return;
    setError("");
    setBusy("Preparing your Outfit Fix…");
    const purchaseId = id || crypto.randomUUID();
    setId(purchaseId);
    try {
      // Save before opening external checkout; storage failure blocks payment.
      await writeDraft({
        image,
        occasion,
        notes,
        budget: "Use what I own",
        savedAt: Date.now(),
        purchaseId,
      });
      await ensureGuestSession();
      if (paid) {
        await generate(purchaseId);
        setBusy("");
        return;
      }
      const order = await api("/api/outfit-fix/order", {
        method: "POST",
        body: JSON.stringify({ id: purchaseId }),
      });
      if (order.status === "paid") {
        setPaid(true);
        await generate(purchaseId);
        setBusy("");
        return;
      }
      if (order.status === "refunded")
        throw new Error(
          "This purchase was refunded. Start a new Outfit Fix from the home page or contact support.",
        );
      if (!window.Razorpay)
        throw new Error(
          "Checkout hasn't loaded. Disable content blocking for checkout or try another browser. No payment has been taken.",
        );
      const checkout = new window.Razorpay({
        key: order.key,
        order_id: order.order_id,
        amount: order.amount,
        currency: order.currency,
        name: "GlamMetrics",
        description: "Outfit Fix · ₹99 once · No subscription",
        prefill: { email: order.email },
        theme: { color: "#742d46" },
        modal: {
          ondismiss: () => {
            setBusy("");
            setError(
              "Checkout closed. If you paid, use Check payment below before retrying.",
            );
          },
        },
        handler: async (reply) => {
          try {
            setBusy("Confirming payment…");
            await api("/api/outfit-fix/order", {
              method: "PATCH",
              body: JSON.stringify({ id: purchaseId, ...reply }),
            });
            setPaid(true);
            await generate(purchaseId);
          } catch (e) {
            setError(
              e instanceof Error
                ? e.message
                : "Please check payment before retrying. You won't need to pay again after confirmation.",
            );
          } finally {
            setBusy("");
          }
        },
      });
      checkout.on("payment.failed", () => {
        setBusy("");
        setError(
          "Payment didn't finish. Check payment if money was debited before retrying.",
        );
      });
      setBusy("Complete your ₹99 payment in checkout…");
      checkout.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
      setBusy("");
    }
  }
  if (result)
    return (
      <main id="main" className="wrap page-space">
        <div className="notice">
          <Check size={16} /> Your Outfit Fix is ready. Purchase reference: {id}
        </div>
        <Report
          report={result}
          occasion={occasion}
          onNewReview={() => {
            setResult(null);
            setId("");
            setPaid(false);
            setConsent(false);
          }}
        />
      </main>
    );
  return (
    <main id="main" className="wrap page-space fix-studio">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onReady={() => setReady(true)}
        onError={() =>
          setError(
            "Payment checkout couldn't load. Please try another browser.",
          )
        }
      />
      <div className="page-heading">
        <h1>
          Let’s fix <em>this outfit.</em>
        </h1>
        <p>One photo. One occasion. One complete styling plan.</p>
      </div>
      <div className="fix-checkout-layout">
        <form className="fix-form" onSubmit={submit}>
          <h2>Start with your outfit.</h2>
          <p>
            A clear full-outfit mirror selfie works. You can crop out your face.
          </p>
          <input
            ref={upload}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => select(e.target.files?.[0])}
          />
          <input
            ref={camera}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => select(e.target.files?.[0])}
          />
          {image ? (
            <div className="fix-photo">
              <Image
                src={image}
                alt="Your selected outfit"
                fill
                unoptimized
                sizes="400px"
              />
              <button
                type="button"
                className="button secondary"
                disabled={!!busy}
                onClick={() => upload.current?.click()}
              >
                Change photo
              </button>
            </div>
          ) : (
            <div className="fix-upload">
              <Camera size={32} strokeWidth={1} />
              <p>
                Show the clothes.
                <br />
                We’ll sort the details.
              </p>
              <button
                type="button"
                className="button primary"
                disabled={!!busy}
                onClick={() => upload.current?.click()}
              >
                <Upload size={17} /> Choose a photo
              </button>
              <button
                type="button"
                className="text-link"
                disabled={!!busy}
                onClick={() => camera.current?.click()}
              >
                Take a photo
              </button>
              <small>JPG, PNG or WebP · up to 15 MB</small>
            </div>
          )}
          <label className="fix-field">
            Where are you wearing it?
            <select
              value={occasion}
              disabled={!!busy}
              onChange={(e) => setOccasion(e.target.value)}
            >
              {occasions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className="fix-field">
            Anything we should know? <span>Optional</span>
            <textarea
              maxLength={500}
              value={notes}
              disabled={!!busy}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="I have gold flats and a black bag. Prefer covered shoulders and minimal jewellery."
              rows={3}
            />
          </label>
          <label className="consent">
            <input
              type="checkbox"
              checked={consent}
              disabled={!!busy}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              I’m 18+, have permission to use this photo, and agree to the{" "}
              <Link href="/terms">Terms</Link> and{" "}
              <Link href="/privacy">AI photo processing</Link>.
            </span>
          </label>
          <p className="fineprint">
            ₹99 once · no subscription. AI-written plan, not a try-on image.{" "}
            <Link className="text-link" href="/sample">
              See an example
            </Link>
          </p>
          {error && (
            <p className="error" role="alert">
              {error}{" "}
              <Link className="text-link" href="/auth?next=/analysis">
                Prefer to sign in?
              </Link>
            </p>
          )}
          <button
            className="button primary full"
            disabled={!!busy || !image || !consent || (!paid && !ready)}
          >
            {busy ? (
              <>
                <LoaderCircle className="spin" size={18} />
                {busy}
              </>
            ) : paid ? (
              "Generate my paid Outfit Fix"
            ) : (
              <>
                Get my Outfit Fix · ₹99 <ArrowRight size={18} />
              </>
            )}
          </button>
          {id && (
            <div className="fix-recovery">
              <p>
                Purchase reference: <code>{id}</code>
              </p>
              <button
                type="button"
                className="text-link"
                disabled={!!busy}
                onClick={checkPayment}
              >
                Already paid or interrupted? Check payment & result
              </button>
              <Link href="/contact" className="text-link">
                Need help with this purchase?
              </Link>
            </div>
          )}
        </form>
        <aside className="fix-order-summary">
          <h2>Your Outfit Fix.</h2>
          <div className="offer-price">
            ₹99<span>once</span>
          </div>
          <p>One finished plan for the outfit you upload.</p>
          <ul>
            {[
              "3 specific changes to make it work",
              "One complete look for your occasion",
              "Shoes, accessories & finishing touches",
              "A practical getting-ready checklist",
              "Downloadable written plan",
            ].map((t) => (
              <li key={t}>
                <Check size={16} />
                {t}
              </li>
            ))}
          </ul>
          <p>
            <strong>No subscription. No auto-renewal.</strong>
            <br />
            No account signup required to buy.
          </p>
          <p className="fineprint">
            AI-generated styling advice, not a human consultation or a new
            outfit image. Generation starts after verified payment and may take
            a minute or more. A failed attempt can be retried on the same
            purchase.
          </p>
          <p className="fineprint">
            Guest access stays in this browser. Download your result or connect
            an email afterwards to keep access across devices. Your draft photo
            is stored on this device until completion or expiry.
          </p>
          <Link href="/sample" className="text-link">
            See the complete example <ArrowRight size={15} />
          </Link>
        </aside>
      </div>
    </main>
  );
}
