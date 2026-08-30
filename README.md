# DEALCHECK — full Vercel-ready MVP

DEALCHECK is an English, mobile-first AI shopping decision assistant based on the supplied working DEALCHECK build and the DEALCHECK Product & Website Master Specification.

## Included

- Premium white / milk visual design
- Product URL analysis
- Screenshot / camera-library input
- Manual product + price fallback
- Free first analysis
- Fresh public web evidence through OpenAI web search
- Exact/materially-equivalent product matching instructions
- Fair-price range + confidence
- Deal Score and Value-for-Money score
- Potential overpayment when evidence is sufficient
- Full Premium report
- Verified "Best place to buy" section
- 3–5 better-value alternatives when reliable evidence exists
- Buy / Wait / Compare recommendation
- Save product
- Wishlist
- Target price
- My Checks
- Dashboard
- Account profile using email only
- Stripe embedded Payment Element
- Stripe subscription at configurable recurring price
- Stripe billing portal
- Server-side Stripe webhook confirmation
- Premium status re-check on every page load using the real Stripe subscription
- Legal/trust copy and refund/withdrawal draft
- Local analytics event tracking for the planned funnel
- Price Alerts UI without falsely claiming continuous monitoring

## Important architecture note

This package keeps the original working architecture: static files in `public/` plus Vercel serverless functions in `api/`.

The MVP profile/history/wishlist data is stored in the browser's localStorage. That means it works immediately without adding a database, but it is device/browser-local rather than a true cross-device account. The next backend stage should replace this with a real database and authenticated email flow.

Continuous background price monitoring and email/push alerts are intentionally NOT claimed as live. The UI stores target prices and clearly labels automated monitoring as a next backend step.

## Environment variables

Add these in Vercel -> Project -> Settings -> Environment Variables:

- `OPENAI_API_KEY` — your OpenAI API key
- `OPENAI_MODEL` — an API model ID enabled in your OpenAI project. If blank or `REPLACE_ME`, the code falls back to `gpt-5.4`.
- `STRIPE_SECRET_KEY` — Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `STRIPE_PRICE_ID` — the recurring Stripe Price ID for DEALCHECK Premium, intended to be **$35/month**
- `DEALCHECK_STRIPE_PK` — Stripe publishable key (`pk_...`)
- `SITE_URL` or `NEXT_PUBLIC_SITE_URL` — the deployed Vercel URL, for example `https://your-project.vercel.app`

`SEARCH_API_KEY` is kept in `.env.example` only for compatibility with the earlier package; the current analyzer uses OpenAI web search and does not require a separate search provider key.

Do NOT put secret keys in GitHub.

## Stripe setup

Create a Stripe Product:

**DEALCHECK Premium Monthly**

Create a recurring monthly Price for **$35/month** and put its Price ID into:

`STRIPE_PRICE_ID`

Configure a webhook endpoint:

`https://YOUR-VERCEL-DOMAIN/api/webhook`

Subscribe at minimum to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.paused`

Premium is granted by the server after Stripe confirmation, not merely because the browser displays a payment-success state. The browser also re-checks the saved Stripe subscription/customer/session against Stripe on page load, so a stale localStorage flag cannot keep Premium locked or unlocked by itself.

Enable the Stripe Customer Portal if you want customers to manage billing/cancellation through Stripe.

## GitHub / Vercel deployment

1. Upload the contents of this folder to the GitHub repository root.
2. Do NOT upload `.env` or secret keys.
3. In Vercel, import the GitHub repository.
4. Keep the project as a normal Vercel deployment with no custom build command.
5. Add the Environment Variables above.
6. Deploy.
7. Open the deployment URL and test the free analysis.
8. Test Stripe in Stripe Test mode first.
9. Configure the webhook against the stable Vercel URL.
10. After everything works, switch to the production Stripe keys / price.

## If Vercel shows Build Error

The project does not need a Next.js build. It is intentionally a small static + serverless Vercel app.

If Vercel reports an error, open the failed deployment -> Logs and fix the FIRST red error line. Do not delete project folders or package files blindly.

## Product rules

DEALCHECK should never claim guaranteed lowest prices, guaranteed savings, authenticity, safety, availability or perfect accuracy. It should tell users to verify final price, taxes, shipping, warranty, seller and returns.

Restricted/prohibited categories should be filtered according to applicable country, payment, advertising and safety rules.

## Pricing

The current offer is **$0.99 today**, followed by a **3-day Premium starter period**, then **$35/month** recurring until canceled. The $35/month recurring price is configurable through Stripe's Price ID.



### AI cost control
Free/pre-Premium analyses use `OPENAI_FREE_MODEL` (default `gpt-5.4-mini`). Verified Premium trial/active subscriptions use `OPENAI_PREMIUM_MODEL` (default `gpt-5.6-luna`). The API verifies the Stripe subscription server-side before using the Premium model.

## Stripe checkout update

The current build uses a custom Stripe Elements payment screen instead of Stripe Embedded Checkout. The $0.99 starter payment is collected with a PaymentIntent using `setup_future_usage=off_session`; after the payment succeeds, the server creates the 3-day-trial $35/month subscription using the saved payment method. Apple Pay/Google Pay are rendered through Stripe's Express Checkout Element when the customer's browser/device and Stripe account are eligible.

Required Vercel variables remain `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_TRIAL_DAYS`, and the Stripe publishable key (`DEALCHECK_STRIPE_PK` or `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`). `STRIPE_INTRO_PRICE_ID` is retained only for backwards compatibility and is no longer used by the new checkout.

## V5 stability fix
The V5 build restores the complete dashboard, checks, wishlist, alerts and account UI while retaining the custom Stripe Elements/Express Checkout payment flow. Premium is granted only after a verified successful starter PaymentIntent and subscription activation; stale local Premium flags are cleared when no Stripe identity can be verified.
