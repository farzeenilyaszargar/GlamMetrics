# GlamMetrics: first paying customer experiment

## The offer

**“You have the clothes. Let’s make the look.”** Upload one outfit photo, choose an occasion and receive three complete ways to style it, a no-shopping version, a colour palette and a getting-ready checklist. Save comfort and wardrobe preferences for future plans.

One complete plan is free. Style Circle is **₹99/month for 10 plans** (up to 30 styled looks). The three looks are text instructions for styling the same garment, not generated try-on photographs. Plans are AI-generated. No live shopping catalog or human stylist is included. Unused plans do not roll over. Existing reports remain readable.

The initial audience hypothesis is adult women in India who already have occasion outfits but need help choosing shoes, accessories and a comfortable finish. Treat this as a hypothesis to validate with real users, not proven demand.

## Before spending the ₹1,000

Get five people to try the complete flow on their own phones. Ask them: “Which suggestion would you actually use?” and “Would you pay ₹99 for ten plans like this?” Record their exact answers privately. A compliment about the design is not purchase intent. A completed payment is the main signal.

Complete Google sign-in, one real plan, report retrieval, a live authorised recurring payment, cancellation and webhook delivery on the production domain. Current local credentials were still in Razorpay test mode when this guide was written; test-mode activity is not sales. Supply support contact and business information, and finish the release items in `RELEASE.md`. This implementation does not spend money or launch ads for you.

## A simple ad to record

Use an outfit photo you have permission to advertise and a screen recording of its actual generated result. Avoid customer photos, invented testimonials, fake discounts and fake before/after claims. If using the illustrative site photos, do not present them as customers.

15–20 second vertical demonstration:

1. 0–3 seconds: show an outfit. Text: **“Before buying another outfit, try styling this one.”**
2. 3–7 seconds: select “Dinner” or the closest available occasion, “Use what I own”, and list shoes/accessories actually available.
3. 7–14 seconds: show the three look plans. Zoom into a specific shoe/accessory combination and the no-shopping version.
4. 14–20 seconds: show the checklist. Text: **“Your first style plan is free. GlamMetrics.”** Show **“Then ₹99/month for 10 plans”** clearly.

Suggested caption: “A wardrobe full of clothes, but unsure what goes together? Upload an outfit and get three ways to style it for your occasion, with practical details and a wardrobe-first option. Try one complete AI style plan free. Style Circle: ₹99/month for 10 plans.”

Link to the homepage. Its primary promise and free-plan CTA match this ad. A UTM-tagged link can be used for future analytics, but this app does not currently attribute signups to UTMs or install Meta Pixel. Do not choose purchase-event optimisation assuming those events already exist.

## Budget and decision rules

Use **₹1,000 as a total experiment ceiling**, not a daily budget. Reserve half until you have inspected the first half’s results. Check the actual budget and spending controls offered by Ads Manager before publishing; account minimums and taxes may affect the configuration. Do not distribute this small test across many audiences, messages and landing pages at once.

First goal: one real paying customer, followed by an explanation of why they subscribed. This is not a profit forecast. At ₹99, **11 first-month payments produce ₹1,089 gross**, only ₹89 above ₹1,000 ad spend before payment fees, AI usage, hosting, refunds and taxes. Profit requires more or better acquisition economics. A single first customer is useful validation but does not cover the ad budget.

Inspect the first ₹500:

- No clicks: reconsider the creative/message before spending the remainder.
- Clicks but no new accounts: inspect page speed, sign-in and offer clarity.
- Accounts but no completed plans: inspect photo upload and AI failures; ask users what stopped them.
- Completed plans but no purchases: ask what would make the plan worth paying for. Better wording alone may not solve weak value.
- A payment: ask what prompted it and whether the customer uses the service again before increasing spend.

There is no assumed conversion benchmark for a new product with this tiny sample. Avoid declaring an ad “proven” from a handful of clicks.

## Measure without pretending attribution is installed

Record daily ad spend and link clicks in Meta Ads Manager. Its official [campaign metrics guide](https://developers.meta.com/vr/resources/optimize-ad-campaign/) defines spend and link-click metrics; the page describes Horizon app campaigns, so its app-specific optimisation advice is not a setup guide for this website.

Run `node --env-file=.env.local --import tsx scripts/funnel-summary.ts 14` for aggregate new profiles, retained completed plans and verified unrefunded billing cycles in the previous 14 days. This prints no customer identities. These counts include all traffic, exclude deleted plans, and count renewals as billing cycles. They are not an attributed ad conversion funnel. The script labels test/live payment mode; test results are not revenue.

Keep a simple log: spend, clicks, new accounts, completed plans, new live paying customers, refunds, what customers said. Use the live Razorpay dashboard to distinguish new customers from renewals and to reconcile actual receipts. Never calculate revenue from checkout opens or subscription authorisation alone.
