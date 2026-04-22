"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { onAuthStateChanged, type User } from "firebase/auth";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { auth } from "@/lib/firebase";
import {
  getUserProfileState,
  setSubscriptionLevel,
  type SubscriptionLevel,
  type UserHistoryEntry,
} from "@/lib/user-profile-store";

const planRows = [
  { feature: "Face analysis speed", basic: true, pro: true },
  { feature: "Advanced style insights", basic: false, pro: true },
  { feature: "Full activity history", basic: false, pro: true },
  { feature: "Priority processing", basic: false, pro: true },
  { feature: "Core recommendations", basic: true, pro: true },
  { feature: "Premium support", basic: false, pro: true },
];

const PRO_PRICE_PAISE = 4900;

type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOpenOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler: (response: RazorpayPaymentResponse) => void;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, callback: (response: { error?: { description?: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOpenOptions) => RazorpayInstance;
  }
}

function formatHistoryTime(value: string) {
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function ProfileAvatar({ user }: { user: User }) {
  if (user.photoURL) {
    return (
      <Image
        src={user.photoURL}
        alt={user.displayName || "Profile"}
        width={72}
        height={72}
        className="h-18 w-18 rounded-full object-cover"
      />
    );
  }

  const fallback = (user.displayName || user.email || "U").slice(0, 1).toUpperCase();
  return (
    <span className="inline-flex h-18 w-18 items-center justify-center rounded-full bg-[#F7DBE2] text-2xl font-semibold text-[#ED2738]">
      {fallback}
    </span>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionLevel>("basic");
  const [history, setHistory] = useState<UserHistoryEntry[]>([]);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        const state = getUserProfileState(nextUser.uid);
        setSubscription(state.subscription);
        setHistory(state.history);
      } else {
        setSubscription("basic");
        setHistory([]);
      }
    });
    return () => unsub();
  }, []);

  const providerLabel = useMemo(() => {
    const providerId = user?.providerData?.[0]?.providerId;
    if (!providerId) return "Email";
    if (providerId === "google.com") return "Google";
    if (providerId === "password") return "Email";
    return providerId;
  }, [user]);

  const finalizeUpgrade = () => {
    if (!user) return;
    const nextState = setSubscriptionLevel(user.uid, "pro");
    setSubscription(nextState.subscription);
  };

  const runSuccessConfetti = () => {
    setShowConfetti(true);
    window.setTimeout(() => setShowConfetti(false), 2400);
  };

  const handleUpgradeCheckout = async () => {
    if (!user) return;
    if (subscription === "pro") return;

    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKeyId) {
      setPaymentMessage("Payment key is missing. Please configure NEXT_PUBLIC_RAZORPAY_KEY_ID.");
      return;
    }
    const isLocalhost = typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
    if (!isLocalhost && razorpayKeyId.startsWith("rzp_test_")) {
      setPaymentMessage("Test Razorpay key detected on a non-local domain. Use live keys for production.");
      return;
    }

    if (!window.Razorpay) {
      setPaymentMessage("Razorpay checkout failed to load. Please refresh and try again.");
      return;
    }

    try {
      setIsPaying(true);
      setPaymentMessage(null);

      const createOrderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: PRO_PRICE_PAISE,
          currency: "INR",
          receipt: `pro_${Date.now()}`,
        }),
      });

      const createOrderData = (await createOrderResponse.json()) as {
        order_id?: string;
        amount?: number;
        currency?: string;
        error?: string;
      };

      if (!createOrderResponse.ok || !createOrderData.order_id || !createOrderData.amount || !createOrderData.currency) {
        setPaymentMessage(createOrderData.error || "Could not create payment order. Please try again.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: razorpayKeyId,
        amount: createOrderData.amount,
        currency: createOrderData.currency,
        name: "GlamMetrics",
        description: "Upgrade to Pro",
        order_id: createOrderData.order_id,
        prefill: {
          name: user.displayName || "",
          email: user.email || "",
        },
        theme: {
          color: "#ED2738",
        },
        modal: {
          ondismiss: () => {
            setPaymentMessage("Payment cancelled.");
            setIsPaying(false);
          },
        },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(response),
            });

            const verifyData = (await verifyResponse.json()) as { success?: boolean; error?: string };
            if (!verifyResponse.ok || !verifyData.success) {
              setPaymentMessage(verifyData.error || "Payment verification failed.");
              setIsPaying(false);
              return;
            }

            finalizeUpgrade();
            setPaymentMessage("Payment successful. You are now on Pro.");
            runSuccessConfetti();
            setIsPaying(false);
          } catch {
            setPaymentMessage("Could not verify payment. Please contact support with payment reference.");
            setIsPaying(false);
          }
        },
      });

      razorpay.on("payment.failed", (response) => {
        setPaymentMessage(response.error?.description || "Payment failed. Please try again.");
        setIsPaying(false);
      });

      razorpay.open();
    } catch {
      setPaymentMessage("Unable to start payment right now. Please try again.");
      setIsPaying(false);
    }
  };

  const renderMark = (enabled: boolean) => (
    <span className={enabled ? "font-semibold text-[#0f766e]" : "font-semibold text-[#b42318]"}>{enabled ? "✓" : "✕"}</span>
  );

  const hasTakenTest = history.some(
    (item) => item.action === "Clicked Take Photo" || item.action === "Clicked Upload Photo",
  );

  const ratingValue = hasTakenTest ? "Pending" : "?";
  const confettiPieces = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    left: `${(index * 5) % 100}%`,
    delay: `${(index % 7) * 0.08}s`,
    duration: `${1.5 + (index % 5) * 0.22}s`,
    rotate: `${(index % 2 === 0 ? 1 : -1) * (18 + (index % 8) * 7)}deg`,
    color:
      index % 4 === 0
        ? "#ED2738"
        : index % 4 === 1
          ? "#F7DBE2"
          : index % 4 === 2
            ? "#000000"
            : "#ffffff",
  }));

  return (
    <main className="relative flex min-h-screen w-full flex-col justify-between bg-gradient-to-b from-[#fdecef] via-[#fffdfd] to-[#fff4f6] pt-24">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <Navbar />
      {showConfetti ? (
        <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
          {confettiPieces.map((piece) => (
            <span
              key={piece.id}
              className="confetti-piece"
              style={{
                left: piece.left,
                animationDelay: piece.delay,
                animationDuration: piece.duration,
                backgroundColor: piece.color,
                transform: `rotate(${piece.rotate})`,
              }}
            />
          ))}
        </div>
      ) : null}

      <section className="w-full flex-1 px-4 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-6xl rounded-3xl border border-[#ED2738]/15 bg-white/90 p-6 shadow-[0_22px_60px_rgba(237,39,56,0.12)] backdrop-blur-sm sm:p-8">
          {!user ? (
            <div className="text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">Profile Dashboard</h1>
              <p className="mt-3 text-sm text-black/70">Please sign in to view your profile, plan, and activity history.</p>
              <Link
                href="/auth"
                className="mt-6 inline-flex items-center justify-center rounded-xl border border-[#ED2738] bg-[#ED2738] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border border-[#ED2738]/10 bg-gradient-to-r from-[#fff6f8] to-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.06)]">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <ProfileAvatar user={user} />
                    <div>
                      <h1 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                        {user.displayName || "GlamMetrics User"}
                      </h1>
                      <p className="mt-1 text-sm text-black/70">{user.email}</p>
                      <p className="text-xs text-black/55">Signed in via {providerLabel}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#ED2738]/15 bg-[#F7DBE2]/45 px-4 py-3">
                    <p className="text-xs tracking-wide text-black/60">Current plan</p>
                    <p className="text-sm font-semibold capitalize text-[#ED2738]">{subscription}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                <p className="text-base font-semibold text-black">Statistics</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#ED2738]/15 bg-[#fff7f9] p-4">
                    <p className="text-xs text-black/55">Face Rating</p>
                    <p className="mt-1 text-xl font-semibold text-black">{ratingValue}</p>
                  </div>
                  <div className="rounded-xl border border-[#ED2738]/15 bg-[#fff7f9] p-4">
                    <p className="text-xs text-black/55">Fashion Rating</p>
                    <p className="mt-1 text-xl font-semibold text-black">{ratingValue}</p>
                  </div>
                  <div className="rounded-xl border border-[#ED2738]/15 bg-[#fff7f9] p-4">
                    <p className="text-xs text-black/55">Expression Score</p>
                    <p className="mt-1 text-xl font-semibold text-black">{ratingValue}</p>
                  </div>
                  <div className="rounded-xl border border-[#ED2738]/15 bg-[#fff7f9] p-4">
                    <p className="text-xs text-black/55">Confidence Index</p>
                    <p className="mt-1 text-xl font-semibold text-black">{ratingValue}</p>
                  </div>
                </div>
                {!hasTakenTest ? (
                  <Link
                    href="/#hero"
                    className="mt-4 inline-flex items-center justify-center rounded-lg border border-[#ED2738] bg-[#ED2738] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black"
                  >
                    Take test now
                  </Link>
                ) : null}
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                <p className="text-base font-semibold text-black">Activity history</p>
                {history.length === 0 ? (
                  <p className="mt-3 text-sm text-black/60">No analysis activity yet. Use Take Photo or Upload Photo to start building history.</p>
                ) : (
                  <div className="mt-3 max-h-80 space-y-2 overflow-auto pr-1">
                    {history.map((item) => (
                      <div key={item.id} className="rounded-xl border border-black/10 bg-white p-3">
                        <p className="text-sm text-black/80">{item.action}</p>
                        <p className="text-xs text-black/50">{formatHistoryTime(item.timestamp)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                <p className="text-base font-semibold text-black">Plan comparison</p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[300px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-black/10">
                        <th className="py-2 text-left font-semibold text-black/80">Benefits</th>
                        <th className="py-2 text-center font-semibold text-black/80">Basic</th>
                        <th className="py-2 text-center font-semibold text-black/80">Pro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {planRows.map((row) => (
                        <tr key={row.feature} className="border-b border-black/5">
                          <td className="py-2 text-black/80">{row.feature}</td>
                          <td className="py-2 text-center">{renderMark(row.basic)}</td>
                          <td className="py-2 text-center">{renderMark(row.pro)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={handleUpgradeCheckout}
                  disabled={subscription === "pro" || isPaying}
                  className="mt-4 w-full rounded-lg border border-[#ED2738] bg-[#ED2738] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {subscription === "pro" ? "You are on Pro" : isPaying ? "Processing..." : "Upgrade to Pro ₹49"}
                </button>
                {paymentMessage ? <p className="mt-3 text-xs text-black/65">{paymentMessage}</p> : null}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <style jsx>{`
        .confetti-piece {
          position: absolute;
          top: -20px;
          width: 9px;
          height: 14px;
          border-radius: 2px;
          opacity: 0.9;
          animation-name: confetti-fall;
          animation-timing-function: ease-in;
          animation-fill-mode: forwards;
        }

        @keyframes confetti-fall {
          0% {
            transform: translate3d(0, -5vh, 0) rotate(0deg);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          100% {
            transform: translate3d(0, 108vh, 0) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}
