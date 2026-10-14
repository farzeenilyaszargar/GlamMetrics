import Link from "next/link";
export default function Privacy() {
  return (
    <main id="main" className="wrap page-space legal">
      <h1>
        Privacy <em>Policy.</em>
      </h1>
      <p>
        Last updated: 15 October 2026. This policy describes the GlamMetrics
        style-review service.
      </p>
      <h2>What we process</h2>
      <p>
        We process your account email and sign-in identity, outfit photo,
        occasion, preferences and budget to create a style review. Supabase
        provides authentication and stores your written reports, review balance
        and billing references. Razorpay processes payments; GlamMetrics does
        not receive your full card details or UPI PIN. If you save personal
        style preferences, these are stored with your account in Supabase and
        included in future AI plan requests. You can edit or clear them from My
        plans.
      </p>
      <h2>Your photos and AI reviews</h2>
      <p>
        Your photo is resized in your browser and sent to our server, which
        forwards it to OpenAI for analysis. GlamMetrics does not store the
        original photo in its database or object storage. OpenAI may retain API
        inputs and outputs under its own abuse-monitoring and data-retention
        policies. This is not a promise of zero retention by every provider.
        Only upload photos you have permission to use.
      </p>
      <h2>A draft on your device</h2>
      <p>
        You can buy an Outfit Fix with a guest session. Its session credentials
        are stored in your browser, while written plans and their balances stay
        on our server. Clearing browser data, signing out or changing browsers
        can make an unlinked guest session inaccessible. Connect a verified
        email or Google account to keep access across devices. Payments and paid
        access are never authorised by browser storage alone.
      </p>
      <p>
        A temporary outfit draft is kept in your browser before checkout so you
        can recover an interrupted purchase. It is cleared after a completed
        result and discarded on your next visit if more than two hours old.
        Clearing this site’s browser data removes it immediately.
      </p>
      <p>
        When you connect or sign in to an account from a guest session, the
        browser may temporarily retain a guest access token for up to 45 minutes
        so our server can verify ownership and attach your guest plans. That
        token is removed after a successful attachment or when an expired
        attachment is next checked. Server-side attempt counters limit retries;
        they do not store your photo or IP address.
      </p>
      <h2>Saved information</h2>
      <p>
        Written reviews remain in your account until you request deletion.
        Removing an Outfit Fix from My plans hides it from your journal; contact
        support to erase its content. Older reviews are deleted directly.
        Payment references may need to be retained for billing, refunds and
        accounting. Provider records are subject to their own retention
        policies.
      </p>
      <h2>Your choices</h2>
      <p>
        You can decline photo processing, stop using the service, delete
        reviews, or request account access, correction or deletion through{" "}
        <Link href="/contact">support</Link>. Cancelling a subscription stops
        future billing; it does not automatically delete your account.
      </p>
      <h2>Cookies and sharing</h2>
      <p>
        Browser storage is used to keep you signed in. No advertising pixels are
        currently installed. We do not sell your photos or reports. When you use
        the share button, the summary is shared only through the destination you
        choose; private reports are not made publicly accessible.
      </p>
      <h2>Age and service providers</h2>
      <p>
        This service is for people aged 18 and over. Supabase, OpenAI and
        Razorpay may process information in locations outside your country.
        Contact us with questions about your information or this policy.
      </p>
    </main>
  );
}
