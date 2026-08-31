const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function premiumStatus(status) {
  return ['active', 'trialing'].includes(status);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    const paymentIntentId = String(body.paymentIntentId || '').trim();
    const customerId = String(body.customerId || '').trim();
    const userId = String(body.userId || '').trim().slice(0, 120);
    const priceId = process.env.STRIPE_PRICE_ID;
    const trialDaysRaw = Number.parseInt(process.env.STRIPE_TRIAL_DAYS || '3', 10);
    const trialDays = Number.isFinite(trialDaysRaw) ? Math.min(30, Math.max(1, trialDaysRaw)) : 3;

    if (!paymentIntentId) return res.status(400).json({ error: 'paymentIntentId is required.' });
    if (!priceId) return res.status(500).json({ error: 'STRIPE_PRICE_ID is not configured.' });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(409).json({ error: `Starter payment is not complete yet (${paymentIntent.status}).` });
    }
    if (customerId && paymentIntent.customer && paymentIntent.customer !== customerId) {
      return res.status(403).json({ error: 'Payment/customer mismatch.' });
    }

    const actualCustomerId = paymentIntent.customer || customerId;
    if (!actualCustomerId) return res.status(400).json({ error: 'Stripe customer is missing.' });

    const paymentMethodId = typeof paymentIntent.payment_method === 'string'
      ? paymentIntent.payment_method
      : paymentIntent.payment_method?.id;
    if (!paymentMethodId) return res.status(409).json({ error: 'Saved payment method is not available yet. Please try again.' });

    // Make the operation idempotent from the app side as well as Stripe's side.
    const existing = await stripe.subscriptions.list({ customer: actualCustomerId, status: 'all', limit: 20 });
    const alreadyCreated = existing.data.find(sub => sub.metadata?.intro_payment_intent_id === paymentIntent.id);
    if (alreadyCreated) {
      return res.status(200).json({
        premium: premiumStatus(alreadyCreated.status),
        subscriptionId: alreadyCreated.id,
        customerId: actualCustomerId,
        status: alreadyCreated.status,
        trialEnd: alreadyCreated.trial_end || null
      });
    }

    const subscription = await stripe.subscriptions.create({
      customer: actualCustomerId,
      items: [{ price: priceId, quantity: 1 }],
      default_payment_method: paymentMethodId,
      collection_method: 'charge_automatically',
      trial_period_days: trialDays,
      trial_settings: {
        end_behavior: { missing_payment_method: 'cancel' }
      },
      payment_settings: {
        save_default_payment_method: 'on_subscription'
      },
      metadata: {
        dealcheck_user_id: userId,
        intro_payment_intent_id: paymentIntent.id,
        intro_offer: '0.99_usd',
        trial_days: String(trialDays),
        recurring_price: '35_usd_monthly',
        premium_granted: 'true'
      }
    }, { idempotencyKey: `dealcheck-sub-${paymentIntent.id}` });

    return res.status(200).json({
      premium: premiumStatus(subscription.status),
      subscriptionId: subscription.id,
      customerId: actualCustomerId,
      status: subscription.status,
      trialEnd: subscription.trial_end || null
    });
  } catch (err) {
    console.error('Subscription activation failed:', err);
    return res.status(400).json({ error: err.message || 'Could not activate Premium.' });
  }
};
