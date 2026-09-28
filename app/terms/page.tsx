import Link from "next/link";
export default function Terms() {
  return (
    <main id="main" className="wrap page-space legal">
      <span className="eyebrow">THE DETAILS, CLEARLY</span>
      <h1>
        Terms of <em>Service.</em>
      </h1>
      <p>
        Last updated: 28 September 2026. By creating an account or purchasing a
        membership, you agree to these terms and our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <h2>The service</h2>
      <p>
        GlamMetrics provides automated outfit and styling suggestions for adults
        aged 18 and over. Scores reflect subjective styling guidance, not an
        objective measure of beauty, body shape or personal worth. AI can make
        mistakes. Recommendations are not professional medical advice,
        guaranteed social-media outcomes, or verified shopping offers.
      </p>
      <h2>Your membership</h2>
      <p>
        Every new account receives one complimentary review. The Style Circle
        costs ₹99 per month, the total recurring charge displayed at checkout,
        and includes 10 reviews per billing month. Your monthly allocation
        resets after a verified successful payment. Unused reviews do not roll
        over. A failed review returns its reserved credit; interrupted reviews
        are recovered when you next start a review after five minutes.
      </p>
      <h2>Renewal and cancellation</h2>
      <p>
        Checkout asks you to authorise recurring monthly payments. The current
        mandate supports up to 120 monthly billing cycles. Cancel future billing
        from My edits at any time. Remaining paid reviews stay available until
        the end of the paid period. Once the mandate ends, a new authorisation
        is required to continue billing. See our{" "}
        <Link href="/refunds">Refund Policy</Link> for payment issues.
      </p>
      <h2>Your account and content</h2>
      <p>
        Keep your sign-in links private and provide accurate information. Upload
        only content you own or have permission to use. Do not upload intimate
        images, other people’s photos without permission, or use the service to
        harass others. Automated abuse, bypassing review limits and disrupting
        the service are prohibited.
      </p>
      <h2>Availability and changes</h2>
      <p>
        Features depend on our service providers and may occasionally be
        unavailable. We may update these terms and will communicate material
        membership changes before applying them. These terms do not remove
        rights you have under applicable consumer law. Contact{" "}
        <Link href="/contact">support</Link> with service or billing concerns.
      </p>
    </main>
  );
}
