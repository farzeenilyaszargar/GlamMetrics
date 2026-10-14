"use client";
import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, ShieldCheck, LoaderCircle } from "lucide-react";
import { useSession } from "@/components/session";
import { api } from "@/lib/supabase";
import { hasRecoverableIdentity } from "@/lib/identity";
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
    if (!hasRecoverableIdentity(user)) {
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
        description: "Style Circle · ₹99/month · 10 style plans",
        prefill: { email: d.email },
        theme: { color: "#742d46" },
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
          A fresh plan for
          <br />
          <em>what you already own.</em>
        </h1>
        <p>10 outfit photos. Up to 30 styled looks. One simple membership.</p>
      </div>
      <div className="membership">
        <div className="membership-top">
          <h2>Style Circle</h2>
          <div className="price">
            ₹99<span>/ month</span>
          </div>
          <p>10 personal style plans, every month.</p>
        </div>
        <div className="membership-bottom">
          <ul>
            {[
              "3 complete looks for every outfit you upload",
              "Specific shoes, accessories and finishing touches",
              "A no-shopping version that starts with your wardrobe",
              "Saved personal style & comfort preferences",
              "Getting-ready checklists and colour palettes",
              "Saved plans, printable reports & story cards",
              "Cancel future billing from your account",
            ].map((t) => (
              <li key={t}>
                <Check size={17} />
                {t}
              </li>
            ))}
          </ul>
          {hasRecoverableIdentity(user) && (
            <label className="consent">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <span>
                I agree to ₹99 recurring monthly billing and the{" "}
                <Link href="/terms">Terms</Link>. 10 plans reset each billing
                month; unused plans don’t roll over.
              </span>
            </label>
          )}
          <button
            className="button primary full"
            onClick={checkout}
            disabled={
              busy || (hasRecoverableIdentity(user) && (!accepted || !ready))
            }
          >
            {busy ? (
              <LoaderCircle className="spin" size={18} />
            ) : (
              <>
                {hasRecoverableIdentity(user)
                  ? "Subscribe for ₹99/month"
                  : "Save my account & continue"}{" "}
                <ArrowRight size={18} />
              </>
            )}
          </button>
          {!hasRecoverableIdentity(user) && (
            <p className="fineprint center">
              A verified email or Google account keeps your recurring membership
              recoverable. You’ll return here before payment.
            </p>
          )}
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
        Want to see the value first?{" "}
        <Link href="/analysis">Try one complete style plan free →</Link>
      </p>
      <p className="fineprint center">
        Available payment methods depend on your bank and mandate support.
        Cancellation preserves remaining plans until the end of your paid
        period.
      </p>
      <div className="pricing-expectations">
        <h2>What’s included in one plan?</h2>
        <p>
          Upload one outfit photo and choose an occasion. You receive three
          complete ways to style the same outfit, a wardrobe-first version and a
          checklist. Plans are AI-generated suggestions, not personal
          consultations with a human stylist.
        </p>
        <Link className="text-link" href="/sample">
          See a complete example <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}
