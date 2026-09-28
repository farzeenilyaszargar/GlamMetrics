import Link from "next/link";
export default function Footer() {
  return (
    <footer className="footer">
      <div>
        <Link className="wordmark" href="/">
          glam<span>metrics</span>
        </Link>
        <p>Your style. Turned up.</p>
      </div>
      <div className="footer-links">
        <Link href="/pricing">Plans</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/refunds">Refunds</Link>
        <Link href="/contact">Contact</Link>
      </div>
      <small>© {new Date().getFullYear()} GlamMetrics</small>
    </footer>
  );
}
