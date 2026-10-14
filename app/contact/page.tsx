import Link from "next/link";
export default function Contact() {
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  return (
    <main id="main" className="wrap page-space legal">
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
          paid Outfit Fixes.
        </div>
      )}
      <h2>For payment help</h2>
      <p>
        Include your purchase reference or Razorpay payment reference so we can
        find the transaction. If you have an account, include its email. Never
        share passwords, card details or your UPI PIN.
      </p>
      <p>
        You can resume unfinished purchases from{" "}
        <Link href="/profile">My plans</Link> or use “Check payment & result” in
        the studio. Existing members can also manage their older subscription in
        My plans. See our{" "}
        <Link href="/refunds">refund and cancellation policy</Link> for more
        information.
      </p>
    </main>
  );
}
