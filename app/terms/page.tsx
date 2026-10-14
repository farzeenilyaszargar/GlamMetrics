import Link from "next/link";
export default function Terms() {
  return (
    <main id="main" className="wrap page-space legal">
      <h1>
        Terms of <em>Service.</em>
      </h1>
      <p>
        Last updated: 15 October 2026. By creating an account or purchasing a
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
        The first plan can be tried through a guest session where available.
        Guest access depends on this browser and is subject to a daily
        availability limit. Connect Google or verify an email before
        subscribing, so you can recover access and manage recurring billing.
        Changing accounts does not grant an additional free plan through a
        guest-plan attachment.
      </p>
      <p>
        Every new account receives one complimentary style plan. One plan uses
        one outfit photo and includes three styling variations, a wardrobe-first
        version and a getting-ready checklist. Previously saved reviews remain
        available in their original format. The Style Circle costs ₹99 per
        month, the total recurring charge displayed at checkout, and includes 10
        plans per billing month. Your monthly allocation resets after a verified
        successful payment. Unused reviews do not roll over. A failed review
        returns its reserved credit; interrupted reviews are recovered when you
        next start a review after five minutes.
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
