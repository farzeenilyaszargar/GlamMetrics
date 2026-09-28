import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="empty-state">
      <h1>
        This page has
        <br />
        <em>stepped out.</em>
      </h1>
      <p>Let’s get you back to something lovely.</p>
      <Link href="/" className="button primary">
        Back to the studio →
      </Link>
    </main>
  );
}
