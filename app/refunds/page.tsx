import Link from "next/link";
export default function Refunds() {
  return (
    <main id="main" className="wrap page-space legal">
      <h1>
        Refunds & <em>payment help.</em>
      </h1>
      <h2>Paid but no result?</h2>
      <p>
        Use “Check payment & result” in the studio, or resume your unfinished
        purchase from My plans in the same browser/account. A failed generation
        can be retried on the same purchase without paying again. If the service
        still cannot deliver your Outfit Fix, contact{" "}
        <Link href="/contact">support</Link> within seven days for delivery
        assistance or a refund of the undelivered purchase. Do not buy again to
        resolve a technical failure.
      </p>
      <h2>Duplicate or incorrect charges</h2>
      <p>
        Contact support within seven days with your purchase reference and
        Razorpay payment reference. We will investigate and refund verified
        duplicate or incorrect charges. Never send card details, passwords or a
        UPI PIN. Keep your receipt even if you buy as a guest.
      </p>
      <h2>Completed plans</h2>
      <p>
        Styling advice is subjective. A completed, accessible plan is not
        normally refundable solely because your preference differs from the AI’s
        advice. This does not limit applicable consumer rights.
      </p>
      <h2>Refund processing</h2>
      <p>
        Approved refunds are sent to the original payment method through
        Razorpay. Your bank or payment provider controls when the funds appear.
        Refunds are handled by support, not automatically by the retry button.
      </p>
      <h2>Existing subscriptions</h2>
      <p>
        Outfit Fix has no renewals to cancel. If you have an older Style Circle
        subscription, cancel it in My plans to stop future billing. Cancellation
        does not automatically refund a completed cycle; remaining plans stay
        available until the paid period ends.
      </p>
    </main>
  );
}
