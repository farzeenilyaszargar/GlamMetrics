import { browserDb } from "./supabase";
import { guestTrialsEnabled } from "./identity";
import type { Session } from "@supabase/supabase-js";
let pending: Promise<Session> | null = null;
export async function ensureGuestSession() {
  if (pending) return pending;
  pending = (async () => {
    const db = browserDb();
    if (!db)
      throw new Error(
        "The studio is temporarily unavailable. Please try again shortly.",
      );
    const { data, error } = await db.auth.getSession();
    if (error) throw error;
    if (data.session) return data.session;
    if (!guestTrialsEnabled)
      throw new Error("Please sign in to continue with your Outfit Fix.");
    const created = await db.auth.signInAnonymously();
    if (created.error || !created.data.session)
      throw new Error(
        "Guest plans are temporarily unavailable. Your photo is still here. You can sign in instead or try again shortly.",
      );
    return created.data.session;
  })();
  try {
    return await pending;
  } finally {
    pending = null;
  }
}

const claimKey = "glammetrics-guest-claim";
export async function rememberGuestForClaim() {
  const db = browserDb();
  const { data } = await db!.auth.getSession();
  if (!data.session?.user.is_anonymous) return;
  // Short-lived proof in this browser, including an email callback in a new tab.
  localStorage.setItem(
    claimKey,
    JSON.stringify({
      token: data.session.access_token,
      id: data.session.user.id,
      until: Math.min(
        Date.now() + 45 * 60000,
        (data.session.expires_at || 0) * 1000,
      ),
    }),
  );
}
export async function claimGuestPlans() {
  const raw = localStorage.getItem(claimKey);
  if (!raw) return;
  const saved = JSON.parse(raw);
  const db = browserDb();
  const { data } = await db!.auth.getSession();
  if (!data.session || data.session.user.is_anonymous) return;
  if (data.session.user.id === saved.id) {
    localStorage.removeItem(claimKey);
    return;
  }
  if (saved.until < Date.now()) {
    localStorage.removeItem(claimKey);
    throw new Error(
      "The link to your guest plan expired. Your signed-in account is ready, but the guest plan could not be attached. Keep a downloaded copy before switching accounts.",
    );
  }
  const response = await fetch("/api/claim-guest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.session.access_token}`,
    },
    body: JSON.stringify({ guestToken: saved.token }),
  });
  if (!response.ok)
    throw new Error(
      "You’re signed in, but we couldn’t attach your guest plan yet. Retry below before leaving this tab.",
    );
  localStorage.removeItem(claimKey);
}
