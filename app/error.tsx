"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="empty-state">
      <h1>
        A little <em>interruption.</em>
      </h1>
      <p>We couldn’t load this page. Please try again.</p>
      <button onClick={reset} className="button primary">
        Try again
      </button>
    </main>
  );
}
