# GlamMetrics · Outfit Fix

One product, ₹99 once: upload one outfit, select an occasion, pay, and receive one AI-written styling plan. It contains three specific changes, one complete look, shoes/accessories, and a getting-ready checklist. No new subscriptions or free trials. No human consultation, physical products or generated try-on image.

## Run locally

1. `npm ci`
2. Configure `.env.local` from `.env.example`. Never commit credentials.
3. Apply **all five** files in `supabase/migrations` in numeric order. Existing installations need `004_guest_trials.sql` if not already applied, then **`005_outfit_fix.sql`**.
4. Enable Supabase Anonymous Sign-Ins and Manual Linking for guest checkout and optional recovery. `NEXT_PUBLIC_GUEST_TRIAL_ENABLED=true` is the legacy-named switch for anonymous sessions; it no longer grants a free plan. Auth rate limits remain necessary. CAPTCHA token integration is not implemented; if your provider requires it, add the widget before launching guest checkout.
5. Configure Supabase site URL and allowed `/auth` callback for localhost and production. Google Cloud must allow the exact Supabase `/auth/v1/callback`, not just the Supabase origin. Enable Google in Supabase if desired.
6. Configure Razorpay **automatic capture**, API keys and a signed webhook at `/api/razorpay-webhook` for `payment.captured` and `refund.processed`. Retain `subscription.*` events and the old plan ID if existing memberships need management.
7. Set support email, business identity and production URL before enabling live payments. Live order creation refuses missing webhook/support configuration; presence alone does not verify delivery.
8. `npm run dev`, then open [localhost](http://localhost:3000).

## Purchase flow

`/` → `/analysis` → photo + occasion + optional wardrobe notes + consent → secure anonymous session if needed → Razorpay ₹99 order → server signature and captured-payment verification → AI generation → result/download → optional email/Google linking.

Payments and results are owned and authorised in Supabase, never by a local “paid” flag. A durable order reservation recovers ambiguous provider responses without blindly creating a duplicate order. Captured payments are checked for amount, currency and order ownership. Webhooks and “Check payment & result” recover missed callbacks. Full refunds revoke unused generation access and cannot be reversed by delayed capture events.

Migration 005 stores purchases separately from legacy report credits. Row locks prevent parallel generation, attempt numbers fence stale responses, and up to five failed/interrupted attempts reuse the paid purchase. A completed result cannot be replaced. Exhausted attempts require support/refund; they do not prompt another payment.

Browser IndexedDB retains the draft for refresh recovery, cleared after success or on the next read after two hours. A guest who loses browser storage can lose access: download the written plan or link a verified identity. The existing two-session proof flow now moves one-time purchases as well as reports. Original photos are not persisted server-side. AI provider retention is disclosed in the privacy policy.

`/pricing` redirects to the same product studio. New subscription creation returns HTTP 410. Existing membership cancellation, reconciliation, paid-period credits and `/legacy-studio` remain available; a new one-time purchase does not cancel an existing mandate.

## Verification

`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

Tests use real SQL in PGlite for tenant boundaries, service-only writes, payment replay/refunds, retry limits, stale completion fencing, guest ownership transfer and legacy billing. Model tests require exactly one complete look and three changes; older reports remain readable.

Optional actual AI smoke (uses the illustrative generated image, incurs API usage):

`TEST_SINGLE_LOOK=true node --env-file=.env.local --import tsx scripts/test-ai.ts`

Legacy hosted scripts `test-hosted.ts`, `test-plan-flow.ts`, `test-guest-flow.ts` are historical diagnostics for the credit/subscription flow and must not be mistaken for one-off checkout end-to-end verification. In particular, free-trial and subscription-creation assertions are obsolete. The new flow needs a hosted Razorpay test purchase, webhook/refund/retry and guest-linking test before live release.

See [RELEASE.md](RELEASE.md) for unresolved gates and [LAUNCH_PLAN.md](LAUNCH_PLAN.md) for the ₹1,000 validation experiment. `scripts/funnel-summary.ts` prints aggregate purchase counts, not ad attribution. No Meta Pixel is installed.

## Assets and implementation references

Both site fashion photographs are generated illustrations, not customers/testimonials. See `public/images/ASSETS.md` for the campaign asset. The sample is explicitly illustrative, not a customer result.

Structured output follows [OpenAI documentation](https://developers.openai.com/api/docs/guides/structured-outputs); checkout follows [Razorpay Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/).
