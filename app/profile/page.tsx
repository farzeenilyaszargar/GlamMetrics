"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session";
import { api, browserDb } from "@/lib/supabase";
import { writeDraft } from "@/lib/draft";
import ConfirmDialog from "@/components/confirm-dialog";
import {
  Bookmark,
  Sparkles,
  ArrowUpRight,
  LogOut,
  Trash2,
  LoaderCircle,
} from "lucide-react";
import type { StyleReport } from "@/lib/report";
type Account = {
  profile: { credits: number; period_end: string | null };
  reports: {
    id: string;
    occasion: string;
    created_at: string;
    result: StyleReport;
  }[];
  subscription: { status: string; current_end: string | null } | null;
};
export default function Profile() {
  const router = useRouter();
  const { user, loading } = useSession();
  const [account, setAccount] = useState<Account | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try {
      setAccount(await api("/api/account"));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your account.");
    }
  }, []);
  useEffect(() => {
    if (!user) return;
    let active = true;
    api("/api/account")
      .then((data) => {
        if (active) setAccount(data);
      })
      .catch((error) => {
        if (active) setError(error.message);
      });
    return () => {
      active = false;
    };
  }, [user]);
  async function sync() {
    setBusy(true);
    try {
      await api("/api/subscription", { method: "PATCH" });
      await refresh();
      setNotice("Payment status refreshed.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not refresh.");
    } finally {
      setBusy(false);
    }
  }
  async function cancel() {
    setBusy(true);
    try {
      await api("/api/subscription", { method: "DELETE" });
      await refresh();
      setConfirm(false);
      setNotice(
        "Your subscription is cancelled. Remaining reviews are available until the end of your paid period.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not cancel.");
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!deleteId) return;
    setBusy(true);
    try {
      await api(`/api/reports/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  }
  if (loading)
    return (
      <main id="main" className="empty-state">
        <LoaderCircle className="spin" />
        <p>Opening your wardrobe…</p>
      </main>
    );
  if (!user)
    return (
      <main id="main" className="empty-state">
        <Bookmark size={32} />
        <h1>
          Your style story,
          <br />
          <em>all in one place.</em>
        </h1>
        <p>Sign in to save your edits and pick up where you left off.</p>
        <Link href="/auth?next=/profile" className="button primary">
          Open my wardrobe <ArrowUpRight size={18} />
        </Link>
      </main>
    );
  const active =
    account?.subscription &&
    !["cancelled", "completed", "expired", "failed"].includes(
      account.subscription.status,
    );
  return (
    <main id="main" className="wrap page-space">
      <div className="section-heading">
        <div>
          <h1>
            My <em>edits.</em>
          </h1>
          <p>{user.email}</p>
        </div>
        <button
          className="text-link"
          onClick={async () => {
            await browserDb()?.auth.signOut();
            await writeDraft(null).catch(() => {});
            router.push("/");
          }}
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
      {error && (
        <div className="error" role="alert">
          {error} <button onClick={refresh}>Try again</button>
        </div>
      )}
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      <section className="account-banner">
        <div>
          <Sparkles size={22} />
          <h2>
            {account ? `${account.profile.credits} reviews` : "Loading…"}
            <em> waiting for your next look.</em>
          </h2>
          <p>
            {account?.profile.period_end
              ? `Current reviews available until ${new Date(account.profile.period_end).toLocaleDateString("en-IN")}.`
              : "Your first review is complimentary."}
          </p>
        </div>
        <Link className="button primary" href="/analysis">
          Create a style edit <ArrowUpRight size={18} />
        </Link>
      </section>
      <div className="section-heading">
        <h2>
          Your <em>style journal.</em>
        </h2>
        <span className="count-label">
          {account?.reports.length || 0} saved
        </span>
      </div>
      {account?.reports.length ? (
        <div className="saved-grid">
          {account.reports.map((r) => (
            <article className="saved-card" key={r.id}>
              <div className="saved-palette">
                {r.result.palette.map((c) => (
                  <i key={c.hex} style={{ background: c.hex }} />
                ))}
                <strong>
                  {r.result.score}
                  <small>/100</small>
                </strong>
              </div>
              <span className="report-meta">
                {r.occasion} ·{" "}
                {new Date(r.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <h3>{r.result.title}</h3>
              <div className="row-between">
                <Link className="text-link" href={`/reports/${r.id}`}>
                  Open your edit <ArrowUpRight size={16} />
                </Link>
                <button
                  className="icon-button"
                  aria-label={`Delete ${r.result.title}`}
                  onClick={() => setDeleteId(r.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="journal-empty">
          <Bookmark size={28} />
          <h3>A blank page. So many possibilities.</h3>
          <p>Your personal style reviews will appear here.</p>
          <Link className="text-link" href="/analysis">
            Create your first edit →
          </Link>
        </div>
      )}
      <section className="billing-panel">
        <div>
          <h2>
            The Style <em>Circle.</em>
          </h2>
          <p>
            {active
              ? `₹99/month · ${account?.subscription?.status}`
              : "10 outfit reviews every month, for ₹99."}
          </p>
        </div>
        <div className="billing-actions">
          {active ? (
            <>
              <button
                className="button secondary"
                disabled={busy}
                onClick={sync}
              >
                Refresh payment status
              </button>
              <button className="text-link" onClick={() => setConfirm(true)}>
                Cancel subscription
              </button>
            </>
          ) : (
            <Link className="button primary" href="/pricing">
              Explore membership <ArrowUpRight size={17} />
            </Link>
          )}
        </div>
      </section>
      {(confirm || deleteId) && (
        <ConfirmDialog
          title={deleteId ? "Delete this edit?" : "Cancel your membership?"}
          onClose={() => {
            if (!busy) {
              setConfirm(false);
              setDeleteId(null);
            }
          }}
        >
          <p>
            {deleteId
              ? "This removes the saved report permanently. It doesn't refund a used review."
              : "Future billing will stop. Your remaining reviews stay available until your paid period ends."}
          </p>
          <div className="dialog-actions">
            <button
              autoFocus
              className="button secondary"
              disabled={busy}
              onClick={() => {
                setConfirm(false);
                setDeleteId(null);
              }}
            >
              Keep it
            </button>
            <button
              className="button primary"
              disabled={busy}
              onClick={deleteId ? remove : cancel}
            >
              {busy
                ? "Please wait…"
                : deleteId
                  ? "Delete edit"
                  : "Confirm cancellation"}
            </button>
          </div>
        </ConfirmDialog>
      )}
    </main>
  );
}
