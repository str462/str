const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const id = String(req.query.sessionId || '').trim();
    if (!id) return res.status(400).json({ error: 'sessionId is required.' });
    const session = await stripe.checkout.sessions.retrieve(id, { expand: ['subscription'] });
    const subscription = session.subscription;
    const premium = session.status === 'complete' &&
      session.payment_status === 'paid' &&
      subscription && ['active', 'trialing'].includes(subscription.status);

    return res.status(200).json({
      complete: session.status === 'complete',
      paymentStatus: session.payment_status,
      premium,
      sessionId: session.id,
      subscriptionId: subscription?.id || null,
      customerId: typeof session.customer === 'string' ? session.customer : session.customer?.id || null,
      email: session.customer_details?.email || null,
      name: session.customer_details?.name || null,
      trialEnd: subscription?.trial_end || null,
      currentPeriodEnd: subscription?.current_period_end || null,
      status: subscription?.status || null
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message || 'Could not check checkout status.' });
  }
};
