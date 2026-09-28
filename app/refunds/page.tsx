import Link from "next/link";
export default function Refunds() {
  return (
    <main id="main" className="wrap page-space legal">
      <span className="eyebrow">A CONSIDERED APPROACH TO BILLING</span>
      <h1>
        Refunds & <em>cancellation.</em>
      </h1>
      <h2>Cancel whenever you need</h2>
      <p>
        Cancel your subscription from My edits to stop future renewals. You can
        use remaining reviews through the end of your current paid period.
        Cancellation alone does not automatically refund a completed billing
        cycle.
      </p>
      <h2>Payment problems</h2>
      <p>
        If you were charged twice, did not receive your paid review allocation,
        or could not access the service, contact{" "}
        <Link href="/contact">support</Link> within seven days with your account
        email and Razorpay payment reference. Do not send card details or a UPI
        PIN. We will investigate and either restore access or arrange a refund
        for a verified billing error.
      </p>
      <h2>Failed reviews</h2>
      <p>
        A review that fails before completion returns the reserved review
        credit. An interrupted request may take five minutes to become
        recoverable on your next review attempt. Check My edits before starting
        another review if your connection was interrupted.
      </p>
      <h2>Refund processing</h2>
      <p>
        Approved refunds are returned to the original payment method through
        Razorpay. Your bank or payment provider controls when the refund
        appears. Used reviews are not normally refundable solely because style
        advice differs from your preference. This policy does not limit
        applicable consumer rights.
      </p>
    </main>
  );
}
