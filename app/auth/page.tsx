"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { auth, googleProvider, hasFirebaseConfig } from "@/lib/firebase";

type AuthMode = "signin" | "signup";

type Notice = {
  kind: "success" | "error" | "info";
  text: string;
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c2-1.8 2.9-4.4 2.9-7.3Z"
      />
      <path
        fill="currentColor"
        d="M12 22c2.7 0 5-1 6.7-2.5l-3.3-2.5c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="currentColor"
        d="M6.4 13.9a6.1 6.1 0 0 1 0-3.8V7.5H3a10 10 0 0 0 0 8.9l3.4-2.5Z"
      />
      <path
        fill="currentColor"
        d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3 7.5L6.4 10A6 6 0 0 1 12 6Z"
      />
    </svg>
  );
}

function mapAuthError(error: FirebaseError) {
  const code = error.code || "";

  switch (code) {
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase. In Firebase Console > Authentication > Settings > Authorized domains, add your current domain (for local dev, add localhost and 127.0.0.1).";
    case "auth/operation-not-allowed":
      return "This sign-in method is disabled. In Firebase Console > Authentication > Sign-in method, enable Google and/or Email/Password.";
    case "auth/configuration-not-found":
      return "Google sign-in configuration is missing in Firebase. In Firebase Console > Authentication > Sign-in method, enable Google, set a support email, and save. Then add your domain in Authentication > Settings > Authorized domains.";
    case "auth/popup-blocked":
      return "Popup was blocked by the browser. Allow popups for this site or try again.";
    case "auth/popup-closed-by-user":
      return "Google popup was closed before completing sign-in.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
    case "auth/invalid-credential":
      return "No account found with these credentials.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/email-already-in-use":
      return "This email is already registered. Try signing in instead.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/network-request-failed":
      return "Network request failed. Check your internet connection and retry.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    default:
      return error.message || "Authentication failed. Please try again.";
  }
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!auth) return;

    setPersistence(auth, browserLocalPersistence).catch(() => {
      setNotice({
        kind: "info",
        text: "Could not set local persistence. Sign-in still works for this session.",
      });
    });

    const unsub = onAuthStateChanged(auth, (nextUser) => setUser(nextUser));
    return () => unsub();
  }, []);

  const title = useMemo(() => (mode === "signin" ? "Welcome back" : "Create your account"), [mode]);

  const handleEmailAuth = async () => {
    if (!auth) return;

    if (!email || !password) {
      setNotice({ kind: "error", text: "Please enter both email and password." });
      return;
    }

    try {
      setLoading(true);
      setNotice(null);

      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
        setNotice({ kind: "success", text: "Signed in successfully." });
        router.push("/profile");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setNotice({ kind: "success", text: "Account created successfully." });
        router.push("/profile");
      }
    } catch (err) {
      const error = err as FirebaseError;
      setNotice({ kind: "error", text: mapAuthError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;

    try {
      setLoading(true);
      setNotice(null);
      googleProvider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, googleProvider);
      setNotice({ kind: "success", text: "Signed in with Google." });
      router.push("/profile");
    } catch (err) {
      const error = err as FirebaseError;

      if (error.code === "auth/popup-blocked") {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          const redirectError = redirectErr as FirebaseError;
          setNotice({ kind: "error", text: mapAuthError(redirectError) });
        }
      } else {
        setNotice({ kind: "error", text: mapAuthError(error) });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    setNotice({ kind: "info", text: "Signed out." });
  };

  return (
    <main className="flex min-h-screen w-full flex-col justify-between bg-gradient-to-b from-[#F7DBE2]/70 via-white to-[#fff9fa] pt-24">
      <Navbar />

      <section className="w-full flex-1 px-4 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-[#ED2738]/20 bg-white p-7 shadow-sm sm:p-10">
          <h1 className="font-emilys-candy text-5xl leading-tight text-[#ED2738] max-sm:text-4xl sm:text-6xl">{title}</h1>
          <p className="mt-3 text-sm text-black/70">Use Google or email/password to continue.</p>

          {!hasFirebaseConfig ? (
            <div className="mt-6 rounded-2xl border border-[#ED2738]/20 bg-[#F7DBE2]/40 p-4 text-sm text-black/80">
              Firebase is not fully configured. Add all `NEXT_PUBLIC_FIREBASE_*` values in `.env.local`, then restart the dev server.
            </div>
          ) : null}

          {user ? (
            <div className="mt-6 rounded-2xl border border-[#ED2738]/20 bg-[#F7DBE2]/40 p-4">
              <p className="text-sm text-black/75">Signed in as</p>
              <p className="mt-1 text-sm font-semibold text-black">{user.email}</p>
              <div className="mt-4 flex gap-2 max-sm:flex-col">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full border border-[#ED2738] bg-[#ED2738] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-black max-sm:w-full"
                >
                  Go to home
                </Link>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center rounded-full border border-[#ED2738] bg-white px-4 py-2 text-xs font-medium text-black transition-colors hover:bg-[#F7DBE2] max-sm:w-full"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={!hasFirebaseConfig || loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#ED2738] bg-white px-5 py-3 text-sm font-medium text-black transition-colors hover:bg-[#F7DBE2] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#ED2738]/20" />
                <span className="text-xs text-black/55">or</span>
                <div className="h-px flex-1 bg-[#ED2738]/20" />
              </div>

              <div className="grid gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-xl border border-[#ED2738]/25 px-4 py-3 text-sm outline-none transition-colors focus:border-[#ED2738]"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl border border-[#ED2738]/25 px-4 py-3 text-sm outline-none transition-colors focus:border-[#ED2738]"
                />
                <button
                  onClick={handleEmailAuth}
                  disabled={!hasFirebaseConfig || loading}
                  className="inline-flex w-full items-center justify-center rounded-full border border-[#ED2738] bg-[#ED2738] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {mode === "signin" ? "Sign in with email" : "Create account"}
                </button>
              </div>

              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="text-sm text-[#ED2738] underline underline-offset-4 hover:text-black"
              >
                {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          )}

          {notice ? (
            <p
              className={`mt-4 text-sm ${
                notice.kind === "error"
                  ? "text-[#b42318]"
                  : notice.kind === "success"
                    ? "text-[#0f766e]"
                    : "text-black/70"
              }`}
            >
              {notice.text}
            </p>
          ) : null}
        </div>
      </section>

      <Footer />
    </main>
  );
}
