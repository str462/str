const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const obj = event.data.object;


    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = obj;
      if (paymentIntent.metadata?.offer === 'DEALCHECK99') {
        const priceId = process.env.STRIPE_PRICE_ID;
        const trialDaysRaw = Number.parseInt(process.env.STRIPE_TRIAL_DAYS || '3', 10);
        const trialDays = Number.isFinite(trialDaysRaw) ? Math.min(30, Math.max(1, trialDaysRaw)) : 3;
        const customerId = typeof paymentIntent.customer === 'string' ? paymentIntent.customer : paymentIntent.customer?.id;
        const paymentMethodId = typeof paymentIntent.payment_method === 'string'
          ? paymentIntent.payment_method
          : paymentIntent.payment_method?.id;

        if (priceId && customerId && paymentMethodId) {
          const existing = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 20 });
          const alreadyCreated = existing.data.find(sub => sub.metadata?.intro_payment_intent_id === paymentIntent.id);
          if (!alreadyCreated) {
            const subscription = await stripe.subscriptions.create({
              customer: customerId,
              items: [{ price: priceId, quantity: 1 }],
              default_payment_method: paymentMethodId,
              collection_method: 'charge_automatically',
              trial_period_days: trialDays,
              trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
              payment_settings: { save_default_payment_method: 'on_subscription' },
              metadata: {
                dealcheck_user_id: paymentIntent.metadata?.dealcheck_user_id || '',
                intro_payment_intent_id: paymentIntent.id,
                intro_offer: '0.99_usd',
                trial_days: String(trialDays),
                recurring_price: '35_usd_monthly',
                premium_granted: 'true'
              }
            }, { idempotencyKey: `dealcheck-sub-${paymentIntent.id}` });
            console.log('Premium subscription created from payment_intent.succeeded:', subscription.id);
          }
        }
      }
    }

    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      if (obj.subscription) {
        const subscription = await stripe.subscriptions.retrieve(obj.subscription);
        const active = ['active', 'trialing'].includes(subscription.status);
        await stripe.subscriptions.update(subscription.id, {
          metadata: {
            ...subscription.metadata,
            premium_granted: active ? 'true' : 'false'
          }
        });
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
      const active = ['active', 'trialing'].includes(obj.status);
      await stripe.subscriptions.update(obj.id, {
        metadata: { ...obj.metadata, premium_granted: active ? 'true' : 'false' }
      });
    }

    if (event.type === 'customer.subscription.deleted') {
      // Deleted subscriptions cannot be updated. The app checks the real
      // Stripe status server-side, so no metadata write is necessary here.
      console.log('Subscription deleted:', obj.id);
    }

    if (event.type === 'customer.subscription.paused') {
      await stripe.subscriptions.update(obj.id, {
        metadata: { ...obj.metadata, premium_granted: 'false' }
      });
    }

    if (event.type === 'invoice.paid' && obj.subscription) {
      const subscription = await stripe.subscriptions.retrieve(obj.subscription);
      if (['active', 'trialing'].includes(subscription.status)) {
        await stripe.subscriptions.update(subscription.id, {
          metadata: { ...subscription.metadata, premium_granted: 'true' }
        });
      }
    }

    if (event.type === 'invoice.payment_failed' && obj.subscription) {
      const subscription = await stripe.subscriptions.retrieve(obj.subscription);
      await stripe.subscriptions.update(subscription.id, {
        metadata: { ...subscription.metadata, premium_granted: 'false' }
      });
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing failed:', err);
    return res.status(500).json({ error: 'Webhook processing failed.' });
  }
};

// Stripe signature verification needs the original request body.
module.exports.config = { api: { bodyParser: false } };
