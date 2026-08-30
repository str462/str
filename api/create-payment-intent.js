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
    const userId = String(body.userId || '').trim().slice(0, 120);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }
    if (!name) return res.status(400).json({ error: 'Enter your full name.' });

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        dealcheck_user_id: userId,
        dealcheck_checkout_version: 'custom-elements-v1'
      }
    });

    // The $0.99 starter payment is a normal PaymentIntent. The payment method
    // is explicitly saved for the recurring $35/month subscription created
    // after this payment succeeds.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 99,
      currency: 'usd',
      customer: customer.id,
      setup_future_usage: 'off_session',
      automatic_payment_methods: { enabled: true },
      description: 'DEALCHECK Premium 3-day starter',
      metadata: {
        dealcheck_user_id: userId,
        offer: 'DEALCHECK99',
        starter_amount: '0.99_usd',
        trial_days: String(process.env.STRIPE_TRIAL_DAYS || '3'),
        recurring_price: '35_usd_monthly'
      }
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerId: customer.id
    });
  } catch (err) {
    console.error('PaymentIntent creation failed:', err);
    return res.status(400).json({ error: err.message || 'Could not start secure payment.' });
  }
};
