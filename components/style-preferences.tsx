"use client";
import { useState } from "react";
import { browserDb } from "@/lib/supabase";
import { useSession } from "./session";
import { Check, LoaderCircle } from "lucide-react";

export default function StylePreferences() {
  const { user } = useSession();
  const [value, setValue] = useState(
    typeof user?.user_metadata?.style_preferences === "string"
      ? user.user_metadata.style_preferences
      : "",
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function save() {
    const db = browserDb();
    if (!db) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const { error } = await db.auth.updateUser({
        data: { style_preferences: value.trim() },
      });
      if (error) throw error;
      setMessage("Saved. Your future plans will use these preferences.");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not save preferences. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!user) return null;
  return (
    <details className="preferences-panel">
      <summary>
        Your personal style preferences <span>+</span>
      </summary>
      <div>
        <p>
          Save your comfort preferences and the pieces you reach for. We’ll use
          them in each new plan.
        </p>
        <label htmlFor="saved-preferences">What should we keep in mind?</label>
        <textarea
          id="saved-preferences"
          maxLength={500}
          value={value}
          disabled={busy}
          onChange={(e) => {
            setValue(e.target.value);
            setMessage("");
          }}
          placeholder="I prefer flats, covered shoulders and simple jewellery. I own white trainers, a black handbag and gold studs."
        />
        <small>{value.length}/500</small>
        <button
          className="button secondary"
          type="button"
          disabled={busy}
          onClick={save}
        >
          {busy ? (
            <LoaderCircle className="spin" size={16} />
          ) : (
            <Check size={16} />
          )}
          Save preferences
        </button>
        {message && (
          <p className="notice" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </div>
    </details>
  );
}
