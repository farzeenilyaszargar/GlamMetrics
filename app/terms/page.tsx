import Link from "next/link";
export default function Terms() {
  return (
    <main id="main" className="wrap page-space legal">
      <h1>
        Terms of <em>Service.</em>
      </h1>
      <p>
        Updated 15 October 2026. By using GlamMetrics or purchasing an Outfit
        Fix you agree to these terms and our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <h2>What you are buying</h2>
      <p>
        Outfit Fix costs ₹99 as a one-time total charge. Each purchase provides
        one AI-generated written styling plan for one outfit photo and occasion:
        three practical changes, one complete styled look, shoes and
        accessories, and a getting-ready checklist. This is not a subscription,
        human consultation, physical product, or generated try-on image.
        Additional outfits require separate purchases. AI advice is subjective
        and may be incorrect; we do not guarantee attractiveness, confidence,
        sales or social-media results.
      </p>
      <h2>Payment and delivery</h2>
      <p>
        Razorpay processes payment. Generation starts after server verification
        of a captured payment. Processing may take a minute or more and service
        interruptions can delay delivery. The result appears on this website and
        can be downloaded. A failed attempt can be retried against the same
        purchase, with up to five processing attempts before support assistance
        is required. Never make another payment to resolve an interrupted
        purchase. See our <Link href="/refunds">Refund Policy</Link>.
      </p>
      <h2>Guest access</h2>
      <p>
        No signup is required to buy. Your secure guest session lives in this
        browser; clearing browser storage, signing out or changing browsers can
        lose access. Download your result and retain your purchase/payment
        reference, or connect a verified email or Google account for
        cross-device access. Locally stored data alone is not proof of payment.
      </p>
      <h2>Your content</h2>
      <p>
        You must be at least 18 and own or have permission to use uploaded
        photos. Do not upload intimate content or other people’s images without
        permission. We advise on clothing and occasion, not bodies or personal
        worth. Your image is processed by our AI provider as described in our
        privacy policy. Automated abuse and bypassing payment or retry limits
        are prohibited.
      </p>
      <h2>Existing memberships</h2>
      <p>
        New subscriptions are no longer sold. Any existing Style Circle
        membership retains its original ₹99 monthly billing terms and ten-plan
        allocation until cancelled or ended. Existing customers can manage and
        cancel future billing from My plans and use remaining plans through
        their paid period. Unused plans do not roll over. A one-time Outfit Fix
        does not cancel an existing mandate.
      </p>
      <h2>Support and rights</h2>
      <p>
        Contact <Link href="/contact">support</Link> for service, access or
        billing concerns. Provider availability can interrupt service. These
        terms do not limit applicable consumer rights.
      </p>
    </main>
  );
}
