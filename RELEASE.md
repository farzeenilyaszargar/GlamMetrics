# Release verification · 15 October 2026

## Current product

**Outfit Fix, ₹99 one time.** One photo + occasion → one AI-written finished styling plan. Three specific changes, one complete look, shoes/accessories and checklist. No newly sold subscriptions or free plans. The sample and landing page match the deliverable. Login is optional, not payment authority.

New migration: `005_outfit_fix.sql` after 001–004. Local PGlite tests run the full migration chain. Hosted application of 004/005 is not verified.

## Checks for this change

- Lint, TypeScript and production build passed. All 10 automated tests passed. A real AI smoke using the generated editorial image passed: exactly one look, three improvements, palette and checklist.
- Purchase tests cover unpaid denial, owner isolation, exact amount/currency, duplicate fulfillment, wrong payment replay, failure retries, bounded attempts, stale response fencing, completed-result replay, full-refund revocation, guest attachment and denied direct client writes.
- Browser checks cover mobile landing page, upload-first studio, sample result/download and narrow layout. Hosted checkout is **not** end-to-end verified.

## Release blockers — do not buy traffic yet

1. Configured Supabase hostname returns **DNS ENOTFOUND**. Restore the project or configure an active project locally and on hosting. Re-run auth/database tests; no current claim that login or persistence works against the hosted service.
2. Apply migrations 004 (if pending) and **005**. Enable and test Anonymous Sign-Ins/Manual Linking. Test optional email and Google linking, including existing-account attachment with purchases. Test recovery in Instagram's actual iOS/Android browsers. CAPTCHA integration is still absent if your project requires tokens.
3. Razorpay credentials are still **test** mode. No webhook secret or support email is configured. Supply support email and business identity, confirm refund operations, configure automatic capture and signed webhook delivery. Test captured payment, closed modal, duplicate callbacks, refresh between pay/result, AI failure/retry, full refund and lost guest-session support. An authorised payment alone must not generate a plan.
4. Complete production deployment/env settings, HTTPS, OAuth callbacks, SMTP/email templates and a live smoke test with the owner's explicit payment authorisation. A successful build does not verify any of these.
5. Rotate server secrets previously pasted into chat (Supabase service-role, Razorpay secret, OpenAI key) and put replacements only in ignored env/deployment settings. Never paste or commit replacements. Public Supabase anon keys are not server secrets.
6. No Meta Pixel/purchase attribution is installed. Use only measurements actually available; do not assume Ads Manager receives purchase events. Finalise any tracking consent before adding a pixel.

Existing membership management remains supported. The new product does not automatically cancel old subscriptions. Historical hosted tests from September do not establish current availability.
