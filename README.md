# GlamMetrics

Hosted integration verification: with the local app running and `.env.local` configured, run `node --env-file=.env.local --import tsx scripts/test-hosted.ts`. This explicitly creates two temporary test accounts, checks credit and report access boundaries against Supabase, and deletes the identities and their test data afterward. It sends no emails and makes no payment or AI calls.

A personal styling service for Indian wardrobes. Upload one outfit and receive three complete ways to style it, a wardrobe-first version and a getting-ready checklist. Style Circle is one ₹99/month subscription with 10 style plans per billing month; new accounts receive one complete plan free.

## Run locally

1. `npm ci`
2. Create `.env.local` using the variable names in `.env.example`. Never commit credentials.
3. Apply all SQL migrations in `supabase/migrations` in numeric order using the Supabase SQL editor.
4. Configure Supabase Auth URL settings: site URL plus allowed redirect `http://localhost:3000/auth` for local testing, and your production `/auth` URL for launch.
   For guest trials, apply `004_guest_trials.sql`, enable **Anonymous Sign-Ins** and **Manual Linking** in Supabase Auth, and set `NEXT_PUBLIC_GUEST_TRIAL_ENABLED=true`. Keep Auth rate limits and deployment request limits enabled. The guest AI reservation limit defaults to 40 attempts per UTC day across the project (`GUEST_DAILY_PLAN_LIMIT`); it is not one per person or per IP. If CAPTCHA is required by Auth, a CAPTCHA widget/token integration is needed before guest sign-in can run; this UI does not currently include one.
5. `npm run dev` and open http://localhost:3000.

## What is implemented

- Responsive editorial discovery, outfit studio, sample report, private saved reports, account and pricing pages.
- Supabase email magic-link login. Optional Google login appears when `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`; enable the provider in Supabase first.
- Guest-first free plans: the visitor chooses an image/occasion and consents before an anonymous session is created. The browser stores the session; server-owned credits and reports remain authoritative. Budget and wardrobe notes are optional. A verified email or Google identity is required before any recurring subscription is created.
- Guest upgrades use `linkIdentity`/`updateUser` to preserve the same account. Existing-account sign-in retains a short-lived guest proof; `/api/claim-guest` verifies both sessions before attaching reports. The SQL transaction never transfers billing or invents a new free allowance. Anonymous users are never shown an accidental sign-out action.
- Email-code verification is available without leaving the page. Include `{{ .Token }}` alongside the confirmation link in Supabase's **Change Email** and **Magic Link** templates, with production SMTP. Instagram/Facebook browser detection prefers email because Google can reject embedded-browser OAuth. Test the actual devices; this is not a claim of universal in-app browser compatibility.
- Photo resize in the browser, occasion/budget/preferences, explicit processing consent, validated AI output and private report storage.
- Each new plan requires exactly three complete looks, a no-shopping version and 3–6 checklist actions. Incomplete provider output fails validation instead of consuming a successful review. Older saved reports retain their original format.
- Saved personal style/comfort preferences use Supabase account metadata and are included in new plan requests. These editable preferences never grant billing or access permissions. The style-plan data itself needs no extra migration; the guest flow requires migration 004.
- A browser-only sign-in draft is restored once, discarded if older than two hours on the next visit, and cleared on sign-out. Photos are not saved in the app database.
- Server-verified ₹99 Razorpay subscriptions, captured invoice verification, monthly review reset, duplicate-event protection, cancellation and payment reconciliation.
- Atomic review reservations, failure refunds, interrupted-request recovery and per-account hourly limits.
- Instagram story-card download, share summary, printable/PDF reports, self-service report deletion.
- Privacy, terms, refund and contact pages. Business identity and support settings must be completed before launch.

## Checks

`npm run lint`, `npm test`, `npm run build`, `npm audit`.

Tests run real SQL using an in-memory PostgreSQL-compatible PGlite instance with a minimal Supabase auth schema. They cover permissions, tenant isolation, credit consumption, duplicate refunds, expiry, subscription replay, renewal boundaries and revoked payments. These do not replace hosted Supabase or gateway end-to-end tests.

Optional paid API smoke test: `node --env-file=.env.local --import tsx scripts/test-ai.ts`. Sends the generated editorial image to the configured AI provider and validates the real production analysis schema. It does not send a user's photo.

Optional full plan-flow test: `node --env-file=.env.local --import tsx scripts/test-plan-flow.ts`. Creates a temporary identity, saves style preferences, calls the local authenticated AI endpoint with the illustrative image, verifies persistence and an idempotent retry, then removes test data. Requires a reachable Supabase project and a running local app. It incurs one AI call and sends no emails or payments.

Optional guest ownership test: `node --env-file=.env.local --import tsx scripts/test-guest-flow.ts`. With anonymous sign-in enabled and all four migrations applied, it creates disposable guest/permanent identities, checks the checkout guard and two-session plan attachment, then removes test data. It sends no emails, AI calls or payments. The actual OAuth/email confirmation round trip still needs a manual hosted test.

The provider's strict JSON schema is generated from the same Zod schema used for persistence validation, following the official [Structured Outputs documentation](https://developers.openai.com/api/docs/guides/structured-outputs).

## First customer launch

See [LAUNCH_PLAN.md](LAUNCH_PLAN.md) for the concrete offer, a vertical ad script, the ₹1,000 validation experiment, gross-revenue arithmetic and decision rules. `node --env-file=.env.local --import tsx scripts/funnel-summary.ts 14` prints aggregate operator counts without customer identities. No Meta Pixel or ad-attribution system is installed.

## Release status

See [RELEASE.md](RELEASE.md) for verified checks and remaining launch dependencies. Configuration present on one developer's machine is not shipped to hosting automatically. Never call the application production-ready solely because the build passes.

## Visual asset provenance

The editorial design uses a generated campaign photograph at `public/images/street-edit.png`. Its full prompt and provenance are recorded in `public/images/ASSETS.md`.

`public/images/editorial.png` was generated with the built-in image generation tool. Prompt: portrait fashion editorial of an adult Indian woman in a dusty rose silk saree, delicate gold earrings and a small handbag, in a sunlit ivory courtyard; natural skin texture, warm film-like light, clear outfit detail, no text/logos/overlays. This is illustrative imagery, not a customer testimonial. The sample score is explicitly labelled as an example.
