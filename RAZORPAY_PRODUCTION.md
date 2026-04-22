# Razorpay Production Go-Live Checklist

## 1) Replace test keys with live keys

Set these environment variables in your production host (Vercel/server):

- `RAZORPAY_KEY_ID=rzp_live_...`
- `RAZORPAY_KEY_SECRET=...`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...`

Important:

- `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID` must be exactly the same.
- Never expose `RAZORPAY_KEY_SECRET` to client code.

## 2) Google OAuth + site domains

If auth and checkout are both on your production domain, ensure your production domain is added in:

- Firebase Authorized Domains
- Google OAuth Authorized JavaScript origins / Redirect URIs

## 3) Razorpay dashboard settings

- Activate your Razorpay account for live mode.
- Enable required payment methods (Cards, UPI, Netbanking, etc.).
- Confirm your business profile and KYC status is completed.

## 4) Webhook (recommended for stronger reliability)

Current integration verifies signature from checkout callback.
For production-grade reliability, add Razorpay webhooks for `payment.captured` and reconcile server-side.

Suggested webhook endpoint:

- `POST https://<your-domain>/api/razorpay-webhook`

Use a webhook secret and verify `X-Razorpay-Signature` server-side.

## 5) Smoke test in production

1. Login with a real account.
2. Open `/profile` and click `Upgrade to Pro ₹49`.
3. Complete payment in Razorpay modal.
4. Confirm payment verification success message.
5. Confirm plan updates to `Pro`.

## 6) Common failure causes

- Mixed mode keys (`rzp_test_` with live domain or live secret mismatch).
- `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID` are different values.
- Old env values cached by host (redeploy required after env update).
- Live account not activated in Razorpay dashboard.
