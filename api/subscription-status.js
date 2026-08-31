const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function premiumStatus(status) {
  return ['active', 'trialing'].includes(status);
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const subscriptionId = String(req.query.subscriptionId || '').trim();
    const customerId = String(req.query.customerId || '').trim();
    const sessionId = String(req.query.sessionId || '').trim();

    let subscription = null;
    let customer = null;

    // Prefer the exact subscription saved after checkout.
    if (subscriptionId) {
      subscription = await stripe.subscriptions.retrieve(subscriptionId);
      customer = subscription.customer
        ? await stripe.customers.retrieve(subscription.customer)
        : null;
    } else if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });
      subscription = session.subscription || null;
      customer = session.customer
        ? await stripe.customers.retrieve(typeof session.customer === 'string' ? session.customer : session.customer.id)
        : null;
    } else if (customerId) {
      customer = await stripe.customers.retrieve(customerId);
      const result = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 10 });
      // Select the most relevant current subscription. Trialing/active wins;
      // otherwise return the newest subscription so the UI can show its state.
      subscription = result.data.find(s => premiumStatus(s.status)) || result.data[0] || null;
    } else {
      return res.status(400).json({ error: 'subscriptionId, customerId or sessionId is required.' });
    }

    const status = subscription?.status || null;
    return res.status(200).json({
      premium: premiumStatus(status),
      status,
      subscriptionId: subscription?.id || null,
      customerId: customer?.id || (typeof subscription?.customer === 'string' ? subscription.customer : subscription?.customer?.id) || null,
      email: customer?.email || null,
      name: customer?.name || null,
      trialEnd: subscription?.trial_end || null,
      currentPeriodEnd: subscription?.current_period_end || null,
      cancelAtPeriodEnd: Boolean(subscription?.cancel_at_period_end)
    });
  } catch (err) {
    console.error('Subscription status check failed:', err);
    return res.status(400).json({ error: err.message || 'Could not verify Premium status.' });
  }
};
