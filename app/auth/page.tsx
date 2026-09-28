"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mail, Sparkles, LoaderCircle } from "lucide-react";
import { browserDb } from "@/lib/supabase";
import { useSession } from "@/components/session";
export default function Auth() {
  const { user, configured } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const next = () => {
    const value = new URLSearchParams(window.location.search).get("next");
    return value && /^\/(analysis|pricing|profile)(\?|$)/.test(value)
      ? value
      : "/analysis";
  };
  useEffect(() => {
    if (user) router.replace(next());
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
      const { error } = await db.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(next())}`,
        },
      });
      if (error) throw error;
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
      const { error } = await db.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(next())}`,
        },
      });
      if (error) throw error;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
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
            Good taste.
            <br />
            <em>All you.</em>
          </h2>
        </div>
      </div>
      <section className="auth-form">
        <h1>
          {sent ? (
            "Check your inbox."
          ) : (
            <>
              Your next
              <br />
              <em>great look.</em>
            </>
          )}
        </h1>
        <p>
          {sent
            ? `We've sent a secure sign-in link to ${email}. Open it on this device to continue. Check spam if it doesn't arrive.`
            : "Sign in or create your account. Your first personal style review is on us."}
        </p>
        {!configured && (
          <div className="notice">
            Our studio is getting ready to welcome you.{" "}
            <Link href="/sample">Explore an example review →</Link>
          </div>
        )}
        {!sent ? (
          <>
            {process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true" && (
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
                    Send my sign-in link <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <button
            className="button secondary full"
            onClick={() => setSent(false)}
          >
            Use a different email or resend
          </button>
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
          <Sparkles size={16} /> One free review. No payment details needed.
        </div>
      </section>
    </main>
  );
}
