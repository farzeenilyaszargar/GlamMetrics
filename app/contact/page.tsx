import Link from "next/link";
export default function Contact() {
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  return (
    <main id="main" className="wrap page-space legal">
      <span className="eyebrow">WE’RE HERE FOR YOUR STYLE JOURNEY</span>
      <h1>
        Let’s <em>talk.</em>
      </h1>
      <p>
        Account questions, payment help, privacy requests or a little feedback —
        we’d love to hear from you.
      </p>
      {email ? (
        <a className="button primary" href={`mailto:${email}`}>
          {email} ↗
        </a>
      ) : (
        <div className="notice">
          Customer support details will be published before the studio opens for
          paid memberships.
        </div>
      )}
      <h2>For payment help</h2>
      <p>
        Include your account email and Razorpay payment reference so we can find
        the right transaction. Never share passwords, card details or your UPI
        PIN.
      </p>
      <p>
        You can manage your membership and refresh payment status in{" "}
        <Link href="/profile">My edits</Link>. See our{" "}
        <Link href="/refunds">refund and cancellation policy</Link> for more
        information.
      </p>
    </main>
  );
}
