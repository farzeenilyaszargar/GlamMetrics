# Release verification

## Completed locally

- Mobile-first application and all customer routes implemented.
- Supabase credentials verified against the project API; app tables were not present during verification.
- Google provider confirmed enabled through Supabase Auth settings, and the local Google sign-in button enabled. A completed customer OAuth round trip still needs verification.
- OpenAI model access and a real structured outfit review verified successfully.
- Razorpay **test-mode** monthly plan created for ₹99 and 10 reviews; subscription creation and cancellation tested. The temporary test subscription was cancelled without charging anything.
- Production build, TypeScript validation, ESLint and SQL/security unit tests passed during development.
- Dependency audit was clean after updating Next.js and removing Firebase and the unused Razorpay SDK.
- Homepage and studio inspected in the browser at phone width. Additional visual checks and hosted end-to-end tests are required as described below.

## Required configuration before accepting real payments

1. Apply `001_style_studio.sql`, `002_subscriptions.sql`, `003_billing_boundaries.sql` in Supabase's SQL editor in that order. The service-role API key cannot execute DDL. Alternatively provide a database connection string locally for a migration client.
2. Configure Supabase Auth site URL and redirect allowlist. Configure a production SMTP sender: Supabase's default mail service is unsuitable for public customer acquisition. Test a new customer's sign-in, link expiry and sign-out. Google OAuth is optional and hidden until explicitly enabled.
3. Supply `NEXT_PUBLIC_SUPPORT_EMAIL`, the business/legal operator name, business address and production domain. Confirm the published customer policies reflect the actual business. No unverified business identity is invented in the app.
4. Set up a Razorpay webhook on the public HTTPS endpoint `/api/razorpay-webhook`, using a strong `RAZORPAY_WEBHOOK_SECRET`. Subscribe to `subscription.authenticated`, `subscription.activated`, `subscription.charged`, `subscription.pending`, `subscription.halted`, `subscription.paused`, `subscription.resumed`, `subscription.cancelled`, `subscription.completed`, and `refund.processed` where supported.
5. Configure Razorpay live account and recurring payment methods. Create a **live-mode** monthly plan at ₹99 and replace test keys and `RAZORPAY_PLAN_ID`. Test a genuine authorised transaction and refund before advertising.
6. Rotate credentials shared outside the environment file; use host-managed secret settings for production. Ensure the browser gets only Supabase's public key, never service-role, AI or Razorpay secrets.
7. Configure API provider spend limits and Supabase Auth abuse protections. Apply host-level request limits; application review limits are per verified account, not a replacement for edge abuse controls.

## End-to-end release gate

- New-user email delivery → successful login → one free review → real AI result saved → refresh/new device preserves report.
- Another account cannot read, modify or delete the report or obtain another account's entitlements.
- Checkout with the single ₹99/month plan → mandate authorisation → verified **captured** invoice → 10 reviews.
- Repeat callback/webhook does not grant again. Authorisation-only payments do not grant monthly credits.
- Declined payment, checkout dismissal, provider timeout and interrupted browser return show a recoverable state.
- Renewal resets to 10; remaining credits do not roll over. A failed review spanning renewal does not inflate the new month's allocation.
- Cancellation stops future billing and retains the existing paid entitlement until expiry.
- Full refund removes unused entitlement for the refunded current period; old-period refunds do not affect a newer paid period.
- Webhook delivery is confirmed from Razorpay to the **deployed** service. A localhost handler test is insufficient.
- Test Android Chrome and iOS Safari, plus Instagram's in-app browser: photo upload/camera, magic link, UPI handoff and return, report sharing and download.
- Confirm domain, support route, policies, billing display and production analytics before launching Instagram ads.

## Operational notes

If a subscription creation call times out, its local reservation is retained to prevent duplicate mandates. The next checkout searches recent provider subscriptions by `notes.local_id`; webhook delivery can also recover that reference. If not found, support must reconcile the provider dashboard before marking the reservation failed. Never blindly delete it and retry.

Review reservations interrupted for over five minutes are refunded during the next review attempt, only within the same credit period. Completed reports are idempotently returned for the same request ID. Do not use client storage as payment authority.

Refund requests are handled by the operator in Razorpay; customers cannot initiate arbitrary refunds via an unauthenticated endpoint. Business accounting/tax review and a legal policy review remain the owner's responsibility.
