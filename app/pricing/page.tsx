"use client";
import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, ShieldCheck, LoaderCircle } from "lucide-react";
import { useSession } from "@/components/session";
import { api } from "@/lib/supabase";
type PaymentReply = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};
type CheckoutOptions = {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  prefill: { email: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
  handler: (r: PaymentReply) => Promise<void>;
};
declare global {
  interface Window {
    Razorpay?: new (options: CheckoutOptions) => {
      open: () => void;
      on: (event: string, callback: () => void) => void;
    };
  }
}
export default function Pricing() {
  const { user } = useSession();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  async function checkout() {
    if (!user) {
      router.push("/auth?next=/pricing");
      return;
    }
    if (!window.Razorpay) {
      setError("Checkout is still loading. Please refresh and try again.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const d = await api("/api/subscription", { method: "POST" });
      const checkout = new window.Razorpay({
        key: d.key,
        subscription_id: d.subscription_id,
        name: "GlamMetrics",
        description: "Style Circle · ₹99/month · 10 reviews",
        prefill: { email: d.email },
        theme: { color: "#171717" },
        modal: {
          ondismiss: () => {
            setBusy(false);
          },
        },
        handler: async (r) => {
          try {
            const d = await api("/api/verify-payment", {
              method: "POST",
              body: JSON.stringify(r),
            });
            router.push(
              `/profile?payment=${d.credited ? "success" : "processing"}`,
            );
          } catch (e) {
            setError(
              e instanceof Error
                ? e.message
                : "Verification is pending. Check your account before paying again.",
            );
          } finally {
            setBusy(false);
          }
        },
      });
      checkout.on("payment.failed", () => {
        setError(
          "Payment wasn't completed. You can retry securely in checkout.",
        );
        setBusy(false);
      });
      checkout.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open checkout.");
      setBusy(false);
    }
  }
  return (
    <main id="main" className="wrap page-space pricing-page">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onReady={() => setReady(true)}
        onError={() =>
          setError("Checkout couldn't load. Check your connection and refresh.")
        }
      />
      <div className="page-heading center">
        <h1>
          Your style era.
          <br />
          <em>Starts here.</em>
        </h1>
        <p>One membership. Ten fresh takes on your outfits, every month.</p>
      </div>
      <div className="membership">
        <div className="membership-top">
          <h2>Style Circle</h2>
          <div className="price">
            ₹99<span>/ month</span>
          </div>
          <p>10 personal outfit reviews, every month.</p>
        </div>
        <div className="membership-bottom">
          <ul>
            {[
              "Outfit scores with practical, kind feedback",
              "Occasion-specific styling and colour palettes",
              "Budget-aware ideas for Indian wardrobes",
              "Camera and framing tips for your next post",
              "Saved style edits and downloadable reports",
              "Cancel anytime from your account",
            ].map((t) => (
              <li key={t}>
                <Check size={17} />
                {t}
              </li>
            ))}
          </ul>
          <label className="consent">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>
              I agree to ₹99 recurring monthly billing and the{" "}
              <Link href="/terms">Terms</Link>. 10 reviews reset each billing
              month; unused reviews don’t roll over.
            </span>
          </label>
          <button
            className="button primary full"
            onClick={checkout}
            disabled={busy || !accepted || (!!user && !ready)}
          >
            {busy ? (
              <LoaderCircle className="spin" size={18} />
            ) : (
              <>
                Join the Style Circle <ArrowRight size={18} />
              </>
            )}
          </button>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <p className="fineprint center">
            ₹99 is the total billed monthly. No automatic charge before you
            authorise checkout.
          </p>
          <div className="payment-methods">
            <ShieldCheck size={15} />
            <span>Secure checkout by Razorpay</span>
            <b>UPI</b>
            <b>Cards</b>
          </div>
        </div>
      </div>
      <p className="pricing-footnote">
        Want to get to know us first?{" "}
        <Link href="/analysis">Your first review is on us →</Link>
      </p>
      <p className="fineprint center">
        Available payment methods depend on your bank and mandate support.
        Cancellation preserves remaining reviews until the end of your paid
        period.
      </p>
    </main>
  );
}
