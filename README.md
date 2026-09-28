# GlamMetrics

Hosted integration verification: with the local app running and `.env.local` configured, run `node --env-file=.env.local --import tsx scripts/test-hosted.ts`. This explicitly creates two temporary test accounts, checks credit and report access boundaries against Supabase, and deletes the identities and their test data afterward. It sends no emails and makes no payment or AI calls.

A mobile-first personal styling studio for Indian wardrobes. The Style Circle is one ₹99/month subscription with 10 outfit reviews per billing month; new accounts receive one complimentary review.

## Run locally

1. `npm ci`
2. Create `.env.local` using the variable names in `.env.example`. Never commit credentials.
3. Apply all SQL migrations in `supabase/migrations` in numeric order using the Supabase SQL editor.
4. Configure Supabase Auth URL settings: site URL plus allowed redirect `http://localhost:3000/auth` for local testing, and your production `/auth` URL for launch.
5. `npm run dev` and open http://localhost:3000.

## What is implemented

- Responsive editorial discovery, outfit studio, sample report, private saved reports, account and pricing pages.
- Supabase email magic-link login. Optional Google login appears when `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`; enable the provider in Supabase first.
- Photo resize in the browser, occasion/budget/preferences, explicit processing consent, validated AI output and private report storage.
- A browser-only sign-in draft is restored once, discarded if older than two hours on the next visit, and cleared on sign-out. Photos are not saved in the app database.
- Server-verified ₹99 Razorpay subscriptions, captured invoice verification, monthly review reset, duplicate-event protection, cancellation and payment reconciliation.
- Atomic review reservations, failure refunds, interrupted-request recovery and per-account hourly limits.
- Instagram story-card download, share summary, printable/PDF reports, self-service report deletion.
- Privacy, terms, refund and contact pages. Business identity and support settings must be completed before launch.

## Checks

`npm run lint`, `npm test`, `npm run build`, `npm audit`.

Tests run real SQL using an in-memory PostgreSQL-compatible PGlite instance with a minimal Supabase auth schema. They cover permissions, tenant isolation, credit consumption, duplicate refunds, expiry, subscription replay, renewal boundaries and revoked payments. These do not replace hosted Supabase or gateway end-to-end tests.

Optional paid API smoke test: `node --env-file=.env.local --import tsx scripts/test-ai.ts`. Sends the generated editorial image to the configured AI provider and validates the real production analysis schema. It does not send a user's photo.

## Release status

See [RELEASE.md](RELEASE.md) for verified checks and remaining launch dependencies. Configuration present on one developer's machine is not shipped to hosting automatically. Never call the application production-ready solely because the build passes.

## Visual asset provenance

The dark fashion design uses a new generated campaign photograph at `public/images/street-edit.png`. Its full prompt and provenance are recorded in `public/images/ASSETS.md`.

`public/images/editorial.png` was generated with the built-in image generation tool. Prompt: portrait fashion editorial of an adult Indian woman in a dusty rose silk saree, delicate gold earrings and a small handbag, in a sunlit ivory courtyard; natural skin texture, warm film-like light, clear outfit detail, no text/logos/overlays. This is illustrative imagery, not a customer testimonial. The sample score is explicitly labelled as an example.
