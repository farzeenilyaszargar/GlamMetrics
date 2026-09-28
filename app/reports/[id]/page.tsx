"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/components/session";
import { api } from "@/lib/supabase";
import Report from "@/components/style-report";
import type { StyleReport } from "@/lib/report";
export default function SavedReport({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, loading } = useSession();
  const [data, setData] = useState<{
    result: StyleReport;
    occasion: string;
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (user)
      api(`/api/reports/${id}`)
        .then(setData)
        .catch((e) => setError(e.message));
  }, [id, user]);
  return (
    <main id="main" className="wrap page-space">
      {data ? (
        <Report report={data.result} occasion={data.occasion} />
      ) : error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : !loading && !user ? (
        <div className="empty-state">
          <h1>Your edit is private.</h1>
          <Link href="/auth?next=/profile" className="button primary">
            Sign in to view your edits
          </Link>
        </div>
      ) : (
        <p>Opening your style edit…</p>
      )}
      <Link className="text-link" href="/profile">
        ← Back to my edits
      </Link>
    </main>
  );
}
