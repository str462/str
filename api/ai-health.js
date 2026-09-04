const OpenAI = require('openai');

const FALLBACK_FREE_MODEL = 'gpt-5-mini';
const FALLBACK_PREMIUM_MODEL = 'gpt-5.1';

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const key = String(process.env.OPENAI_API_KEY || '').trim();
  if (!key) {
    return res.status(500).json({
      ok: false,
      authenticated: false,
      error: 'OPENAI_API_KEY is not configured in Vercel.'
    });
  }

  const configuredFree = process.env.OPENAI_FREE_MODEL || FALLBACK_FREE_MODEL;
  const configuredPremium = process.env.OPENAI_PREMIUM_MODEL || process.env.OPENAI_MODEL || FALLBACK_PREMIUM_MODEL;

  try {
    const client = new OpenAI({ apiKey: key });
    const models = await client.models.list();
    const ids = new Set((models.data || []).map(m => m.id));

    return res.status(200).json({
      ok: true,
      authenticated: true,
      apiKeyPresent: true,
      freeModel: {
        configured: configuredFree,
        available: ids.has(configuredFree),
        fallback: FALLBACK_FREE_MODEL,
        fallbackAvailable: ids.has(FALLBACK_FREE_MODEL)
      },
      premiumModel: {
        configured: configuredPremium,
        available: ids.has(configuredPremium),
        fallback: FALLBACK_PREMIUM_MODEL,
        fallbackAvailable: ids.has(FALLBACK_PREMIUM_MODEL)
      },
      note: 'This checks API-key authentication and model visibility. A real product analysis is still the final end-to-end test for billing/quota and web search.'
    });
  } catch (err) {
    const status = Number(err?.status) || 500;
    const code = err?.code || err?.type || 'unknown_error';
    const message = String(err?.message || 'OpenAI API request failed.');
    return res.status(status >= 400 && status < 600 ? status : 500).json({
      ok: false,
      authenticated: status !== 401,
      apiKeyPresent: true,
      code,
      error: status === 401
        ? 'OpenAI rejected the API key. Check that the new key is copied into the correct Vercel environment.'
        : message
    });
  }
};
