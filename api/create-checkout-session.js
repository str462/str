const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    const email = String(body.email || '').trim().toLowerCase();
    const name = String(body.name || '').trim().slice(0, 120);
    const userId = String(body.userId || '').slice(0, 120);
    const siteUrl = String(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || '').replace(/\/$/, '');
    const priceId = process.env.STRIPE_PRICE_ID;
    const introPriceId = process.env.STRIPE_INTRO_PRICE_ID;
    const trialDaysRaw = Number.parseInt(process.env.STRIPE_TRIAL_DAYS || '3', 10);
    const trialDays = Number.isFinite(trialDaysRaw) ? Math.min(30, Math.max(1, trialDaysRaw)) : 3;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }
    if (!name) return res.status(400).json({ error: 'Enter your full name.' });
    if (!priceId) return res.status(500).json({ error: 'Stripe monthly price is not configured. Add STRIPE_PRICE_ID for the $35/month Premium plan.' });
    if (!introPriceId) return res.status(500).json({ error: 'Stripe starter price is not configured. Add STRIPE_INTRO_PRICE_ID for the $0.99 one-time starter payment.' });
    if (!siteUrl) return res.status(500).json({ error: 'SITE_URL is not configured in Vercel.' });

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        dealcheck_user_id: userId,
        account_created_after_intro_payment: 'true'
      }
    });

    // The customer pays a one-time $0.99 starter charge today. The $35/month
    // subscription is created with a 3-day trial and begins billing after it ends.
    // Stripe Checkout dynamically shows eligible methods for the customer's
    // location/currency and subscription compatibility.
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      ui_mode: 'embedded',
      customer: customer.id,
      return_url: `${siteUrl}/?checkout_session_id={CHECKOUT_SESSION_ID}`,
      redirect_on_completion: 'if_required',
      line_items: [
        {
          price: priceId,
          quantity: 1
        },
        {
          price: introPriceId,
          quantity: 1
        }
      ],
      subscription_data: {
        trial_period_days: trialDays,
        trial_settings: {
          end_behavior: { missing_payment_method: 'cancel' }
        },
        metadata: {
          dealcheck_user_id: userId,
          intro_offer: '0.99_usd',
          trial_days: String(trialDays),
          recurring_price: '35_usd_monthly',
          premium_granted: 'false'
        }
      },
      billing_address_collection: 'auto',
      customer_update: { name: 'auto', address: 'auto' },
      // Stripe requires explicit consent_collection when using
      // custom_text.terms_of_service_acceptance.
      consent_collection: { terms_of_service: 'required' },
      custom_text: {
        submit: {
          message: 'You pay $0.99 today. Your 3-day Premium trial starts immediately. After 3 days, $35/month will be charged automatically until you cancel.'
        },
        terms_of_service_acceptance: {
          message: 'By subscribing, you agree to the recurring $35/month charge after the 3-day trial and to the applicable terms.'
        }
      },
      metadata: {
        dealcheck_user_id: userId,
        intro_offer: '0.99_usd',
        trial_days: String(trialDays),
        recurring_price: '35_usd_monthly',
        customer_name: name,
        customer_email: email
      }
    });

    return res.status(200).json({
      clientSecret: session.client_secret,
      sessionId: session.id,
      customerId: customer.id
    });
  } catch (err) {
    console.error('Checkout session creation failed:', err);
    return res.status(400).json({ error: err.message || 'Could not start secure checkout.' });
  }
};
