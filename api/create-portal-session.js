const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { customerId } = req.body || {};
    if (!customerId) return res.status(400).json({ error: 'customerId is required.' });
    const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
    if (!base) return res.status(500).json({ error: 'SITE_URL is not configured.' });
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: base.replace(/\/$/, '') + '/?view=account'
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Could not open billing management.' });
  }
};
