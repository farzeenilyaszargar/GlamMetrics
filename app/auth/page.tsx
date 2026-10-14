"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mail, Sparkles, LoaderCircle } from "lucide-react";
import { browserDb } from "@/lib/supabase";
import { useSession } from "@/components/session";
import { hasRecoverableIdentity } from "@/lib/identity";
import { claimGuestPlans, rememberGuestForClaim } from "@/lib/guest-session";
const subscribeBrowser = () => () => {};
const embeddedBrowser = () => /Instagram|FBAN|FBAV/i.test(navigator.userAgent);
export default function Auth() {
  const embedded = useSyncExternalStore(
    subscribeBrowser,
    embeddedBrowser,
    () => false,
  );
  const { user, configured } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [existing, setExisting] = useState(false);
  const [verificationType, setVerificationType] = useState<
    "email" | "email_change"
  >("email");
  const [merging, setMerging] = useState(false);
  const [claimError, setClaimError] = useState("");
  const guest = user?.is_anonymous === true;
  const next = () => {
    const value = new URLSearchParams(window.location.search).get("next");
    return value &&
      /^\/(analysis|pricing|profile|legacy-studio)(\?|$)/.test(value)
      ? value
      : "/analysis";
  };
  useEffect(() => {
    if (hasRecoverableIdentity(user)) {
      let active = true;
      claimGuestPlans()
        .then(() => {
          if (active) router.replace(next());
        })
        .catch((e) => {
          if (active)
            setClaimError(
              e instanceof Error
                ? e.message
                : "Could not attach your guest plan.",
            );
        });
      return () => {
        active = false;
      };
    }
  }, [user, router]);
  async function emailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const db = browserDb();
      if (!db)
        throw new Error(
          "Sign-in is being prepared. You can explore the example report in the meantime.",
        );
      const redirectTo = `${window.location.origin}/auth?next=${encodeURIComponent(next())}`;
      if (guest) await rememberGuestForClaim();
      const { error } =
        guest && !existing
          ? await db.auth.updateUser({ email }, { emailRedirectTo: redirectTo })
          : await db.auth.signInWithOtp({
              email,
              options: { emailRedirectTo: redirectTo },
            });
      if (error) throw error;
      setVerificationType(guest && !existing ? "email_change" : "email");
      setSent(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Couldn't send the sign-in link.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function google() {
    setBusy(true);
    setError("");
    try {
      const db = browserDb();
      if (!db)
        throw new Error("Sign-in is being prepared. Please try again soon.");
      if (guest) await rememberGuestForClaim();
      const options = {
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(next())}`,
        },
      } as const;
      const { error } =
        guest && !existing
          ? await db.auth.linkIdentity(options)
          : await db.auth.signInWithOAuth(options);
      if (error) throw error;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
      setBusy(false);
    }
  }
  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { error } = await browserDb()!.auth.verifyOtp({
        email,
        token: code.trim(),
        type: verificationType,
      });
      if (error) throw error;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not verify the code.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main" className="wrap auth-layout">
      <div className="auth-photo">
        <Image
          src="/images/street-edit.png"
          alt="Pink blazer styled with black denim and silver accessories"
          fill
          sizes="45vw"
        />
        <div>
          <h2>
            Your wardrobe.
            <br />
            <em>More possibilities.</em>
          </h2>
        </div>
      </div>
      <section className="auth-form">
        <h1>
          {sent ? (
            "Check your inbox."
          ) : (
            <>
              {guest ? "Keep your plans." : "Welcome back."}
              <br />
              <em>Make them yours.</em>
            </>
          )}
        </h1>
        <p>
          {sent
            ? `We've sent a secure sign-in link to ${email}. Open it on this device to continue. Check spam if it doesn't arrive.`
            : guest
              ? "Connect Google or verify your email to keep your Outfit Fixes and access them on another device. This is optional, not a subscription."
              : "Sign in to find your saved plans. Buying an Outfit Fix? You can continue as a guest without signing up."}
        </p>
        {!configured && (
          <div className="notice">
            Our studio is getting ready to welcome you.{" "}
            <Link href="/sample">Explore an example plan →</Link>
          </div>
        )}
        {!sent ? (
          <>
            {embedded && (
              <p className="notice">
                Using Instagram’s browser? Email lets you keep this plan in the
                same browser. Enter the code from your email below if your
                message includes one.
              </p>
            )}
            {process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true" &&
              !embedded && (
                <>
                  <button
                    className="button secondary full"
                    disabled={busy || !configured}
                    onClick={google}
                  >
                    <span className="google-g">G</span>Continue with Google
                  </button>
                  <div className="divider">or continue with email</div>
                </>
              )}
            <form onSubmit={emailLogin}>
              <label htmlFor="email">Email address</label>
              <div className="input-icon">
                <Mail size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                className="button primary full"
                disabled={busy || !configured}
              >
                {busy ? (
                  <LoaderCircle className="spin" size={19} />
                ) : (
                  <>
                    {guest && !existing
                      ? "Save with my email"
                      : "Send my sign-in link"}{" "}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div>
            {
              <form onSubmit={verifyCode}>
                <label htmlFor="verification-code">
                  Or enter the code from your email
                </label>
                <input
                  id="verification-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  minLength={6}
                  maxLength={8}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />
                <button className="button primary full" disabled={busy}>
                  Verify & continue <ArrowRight size={16} />
                </button>
              </form>
            }
            <button
              className="button secondary full"
              onClick={() => setSent(false)}
            >
              Use a different email or resend
            </button>
          </div>
        )}
        {guest && !sent && (
          <button
            type="button"
            className="text-link"
            onClick={() => {
              setExisting((v) => !v);
              setError("");
            }}
          >
            {existing
              ? "Keep this guest account instead"
              : "Already have an account? Sign in instead"}
          </button>
        )}
        {claimError && (
          <div className="error" role="alert">
            <p>{claimError}</p>
            <button
              className="button secondary"
              disabled={merging}
              onClick={async () => {
                setMerging(true);
                try {
                  await claimGuestPlans();
                  router.replace(next());
                } catch (e) {
                  setClaimError(
                    e instanceof Error ? e.message : "Please retry.",
                  );
                } finally {
                  setMerging(false);
                }
              }}
            >
              Retry attaching my guest plan
            </button>
            <button
              className="text-link"
              onClick={() => router.replace(next())}
            >
              Continue to my signed-in account
            </button>
          </div>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <p className="fineprint">
          By continuing, you agree to our <Link href="/terms">Terms</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>. For ages 18 and over.
        </p>
        <div className="auth-perk">
          <Sparkles size={16} />{" "}
          <Link href="/analysis">
            {guest ? "Back to my studio" : "Get an Outfit Fix · ₹99 once"}
          </Link>
        </div>
      </section>
    </main>
  );
}
