const OpenAI = require('openai');
const Stripe = require('stripe');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Free scans use a lower-cost model. Verified Premium customers use the
// higher-quality model. Both can be overridden in Vercel environment variables.
const FREE_MODEL = process.env.OPENAI_FREE_MODEL || 'gpt-5.4-mini';
const PREMIUM_MODEL = process.env.OPENAI_PREMIUM_MODEL || process.env.OPENAI_MODEL || 'gpt-5.6-luna';

async function hasActivePremium(subscriptionId, customerId) {
  if (!stripe) return false;
  try {
    if (subscriptionId) {
      const sub = await stripe.subscriptions.retrieve(String(subscriptionId));
      return ['trialing', 'active'].includes(sub.status);
    }
    if (customerId) {
      const result = await stripe.subscriptions.list({ customer: String(customerId), status: 'all', limit: 10 });
      return result.data.some(sub => ['trialing', 'active'].includes(sub.status));
    }
  } catch (err) {
    console.warn('Premium verification failed; using free model:', err?.message || err);
  }
  return false;
}

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    product: {
      type: 'object',
      additionalProperties: false,
      properties: {
        title: { type: ['string', 'null'] },
        brand: { type: ['string', 'null'] },
        model: { type: ['string', 'null'] },
        sku: { type: ['string', 'null'] },
        seller: { type: ['string', 'null'] },
        availability: { type: ['string', 'null'] },
        currency: { type: ['string', 'null'] },
        current_price: { type: ['number', 'null'] }
      },
      required: ['title','brand','model','sku','seller','availability','currency','current_price']
    },
    market: { type: 'string' },
    restricted_category: { type: 'boolean' },
    restriction_note: { type: ['string', 'null'] },
    deal_score: { type: ['number', 'null'] },
    fair_price_low: { type: ['number', 'null'] },
    fair_price_high: { type: ['number', 'null'] },
    overpayment_low: { type: ['number', 'null'] },
    overpayment_high: { type: ['number', 'null'] },
    confidence: { type: 'string' },
    value_for_money: { type: ['number', 'null'] },
    purchase_confidence: { type: ['number', 'null'] },
    scores: {
      type: 'object',
      additionalProperties: false,
      properties: {
        performance: { type: ['number','null'] },
        build: { type: ['number','null'] },
        features: { type: ['number','null'] },
        reliability: { type: ['number','null'] },
        price_value: { type: ['number','null'] }
      },
      required: ['performance','build','features','reliability','price_value']
    },
    positives: { type: 'array', items: { type: 'string' } },
    concerns: { type: 'array', items: { type: 'string' } },
    important_to_know: { type: 'array', items: { type: 'string' } },
    recommendation: { type: 'string' },
    summary: { type: 'string' },
    suggested_target_price: { type: ['number','null'] },
    seller_notes: { type: ['string','null'] },
    evidence: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          source: { type: 'string' },
          seller: { type: ['string','null'] },
          url: { type: 'string' },
          price: { type: ['number','null'] },
          currency: { type: ['string','null'] },
          condition: { type: ['string','null'] },
          timestamp: { type: ['string','null'] },
          match_note: { type: 'string' }
        },
        required: ['source','seller','url','price','currency','condition','timestamp','match_note']
      }
    },
    best_place_to_buy: {
      type: 'object',
      additionalProperties: false,
      properties: {
        retailer: { type: ['string','null'] },
        seller: { type: ['string','null'] },
        price: { type: ['number','null'] },
        currency: { type: ['string','null'] },
        url: { type: ['string','null'] },
        reason: { type: 'string' }
      },
      required: ['retailer','seller','price','currency','url','reason']
    },
    alternatives: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          brand: { type: ['string','null'] },
          model: { type: ['string','null'] },
          price: { type: ['number','null'] },
          currency: { type: ['string','null'] },
          retailer: { type: ['string','null'] },
          url: { type: ['string','null'] },
          reason: { type: 'string' },
          similarity: { type: 'string' }
        },
        required: ['title','brand','model','price','currency','retailer','url','reason','similarity']
      }
    }
  },
  required: [
    'product','market','restricted_category','restriction_note','deal_score',
    'fair_price_low','fair_price_high','overpayment_low','overpayment_high',
    'confidence','value_for_money','purchase_confidence','scores','positives',
    'concerns','important_to_know','recommendation','summary','suggested_target_price',
    'seller_notes','evidence','best_place_to_buy','alternatives'
  ]
};

function cleanUrl(value) {
  if (!value) return null;
  try {
    const u = new URL(value);
    if (!/^https?:$/.test(u.protocol)) return null;
    return u.toString();
  } catch (_) {
    return null;
  }
}


function finiteNumber(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeReport(report, inputPrice, inputCurrency) {
  const r = report && typeof report === 'object' ? report : {};
  r.product = r.product && typeof r.product === 'object' ? r.product : {};

  const manualPrice = finiteNumber(inputPrice);
  const evidencePrices = Array.isArray(r.evidence)
    ? r.evidence.map(e => finiteNumber(e?.price)).filter(v => v != null && v > 0)
    : [];
  const bestPrice = finiteNumber(r.best_place_to_buy?.price);

  // If the model could not extract the current price, trust the explicit
  // manual price supplied by the user first, then verified evidence.
  if (manualPrice != null) r.product.current_price = manualPrice;
  else if (finiteNumber(r.product.current_price) == null && bestPrice != null) r.product.current_price = bestPrice;
  else if (finiteNumber(r.product.current_price) == null && evidencePrices.length) {
    r.product.current_price = evidencePrices[0];
  }
  if (!r.product.currency) r.product.currency = inputCurrency || 'EUR';

  const current = finiteNumber(r.product.current_price);

  // The UI promises a complete decision snapshot. When market evidence is
  // insufficient, provide a clearly-labelled estimate instead of blank cards.
  // This is intentionally conservative and is not presented as verified market data.
  if (current != null && current > 0) {
    let low = finiteNumber(r.fair_price_low);
    let high = finiteNumber(r.fair_price_high);
    if (low == null || high == null || low <= 0 || high <= 0 || low > high) {
      low = Math.max(0.01, current * 0.85);
      high = current * 1.05;
      r.fair_price_low = Number(low.toFixed(2));
      r.fair_price_high = Number(high.toFixed(2));
      r.fair_price_estimated = true;
    }

    if (finiteNumber(r.overpayment_low) == null || finiteNumber(r.overpayment_high) == null) {
      r.overpayment_low = Number(Math.max(0, current - high).toFixed(2));
      r.overpayment_high = Number(Math.max(0, current - low).toFixed(2));
      r.overpayment_estimated = true;
    }

    const existingScore = finiteNumber(r.deal_score);
    const value = finiteNumber(r.value_for_money);
    const confidence = finiteNumber(r.purchase_confidence);
    const scoreParts = Object.values(r.scores || {}).map(finiteNumber).filter(v => v != null);
    if (existingScore == null) {
      const fallback = value ?? confidence ?? (scoreParts.length ? scoreParts.reduce((a,b)=>a+b,0)/scoreParts.length : 50);
      r.deal_score = Math.max(0, Math.min(100, Math.round(fallback)));
      r.deal_score_estimated = true;
    }
  } else if (finiteNumber(r.deal_score) == null) {
    // A rating is always visible even when no price could be established.
    r.deal_score = 50;
    r.deal_score_estimated = true;
  }

  if (!r.confidence) r.confidence = r.deal_score_estimated ? 'Limited' : 'Moderate';
  return r;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    const url = cleanUrl(body.url);
    const productName = String(body.productName || '').trim().slice(0, 300);
    const price = body.price === '' || body.price == null ? null : Number(body.price);
    const currency = String(body.currency || 'EUR').toUpperCase();
    const market = String(body.market || 'Europe').slice(0, 40);
    const country = String(body.country || 'EU').slice(0, 60);
    const screenshotDataUrl = typeof body.screenshotDataUrl === 'string' ? body.screenshotDataUrl : null;

    if (!url && !productName && !screenshotDataUrl) {
      return res.status(400).json({ error: 'Add a product link, screenshot, or product name.' });
    }
    if (price != null && (!Number.isFinite(price) || price < 0)) {
      return res.status(400).json({ error: 'Enter a valid product price.' });
    }
    if (screenshotDataUrl && screenshotDataUrl.length > 7_000_000) {
      return res.status(413).json({ error: 'That screenshot is too large. Please upload a smaller image.' });
    }

    const instructions = `
You are DEALCHECK, an AI shopping decision assistant.
Analyze ONE physical product using FRESH public web evidence available to you. The user wants a practical answer before buying.

MARKET: ${market}
COUNTRY/REGION: ${country}
USER URL: ${url || 'none'}
MANUAL PRODUCT NAME: ${productName || 'none'}
MANUAL PRICE: ${price == null ? 'unknown' : price} ${currency}

Critical evidence rules:
- Use fresh web search evidence for live prices. Never rely on memory for current prices.
- Prefer the manufacturer's store, reputable retailers, major marketplaces, and price-comparison sources that are publicly accessible.
- Compare exact or materially equivalent variants only. Check model/SKU, size, storage/capacity, color and condition when price can change.
- Separate new, refurbished and used products.
- Never invent a retailer, price, URL, review, specification or alternative.
- If evidence is weak, return nulls and lower confidence. Do not manufacture a fair-price range or overpayment number.
- The screenshot is evidence, not proof of the whole market.
- If a product is restricted/prohibited in the user's country/region or should not be analyzed under platform/payment/safety rules, set restricted_category=true and explain briefly. Do not provide purchasing guidance for it.
- Do not make unsupported claims of fraud, counterfeit, safety defects, authenticity or guaranteed savings.
- The best_place_to_buy must be the strongest VERIFIED current offer among the evidence, balancing price, seller reliability, availability and variant match. If no reliable winner exists, use nulls and explain why.
- alternatives should contain 3–5 materially comparable products only when reliable current evidence exists. Do not recommend an alternative just because it is cheaper.
- Keep evidence separate from assessment.
- Scores are decision aids, not scientific measurements.
- Recommendation must be one of BUY, WAIT, COMPARE, or INSUFFICIENT DATA.
- Return structured JSON only.
`;

    const input = [{ type: 'input_text', text: instructions }];
    if (url) input.push({ type: 'input_text', text: `Open and inspect this product URL if accessible: ${url}` });
    if (screenshotDataUrl) input.push({ type: 'input_image', image_url: screenshotDataUrl });

    const subscriptionId = typeof body.subscriptionId === 'string' ? body.subscriptionId.trim().slice(0, 200) : '';
    const customerId = typeof body.customerId === 'string' ? body.customerId.trim().slice(0, 200) : '';
    const premium = await hasActivePremium(subscriptionId, customerId);
    const selectedModel = premium ? PREMIUM_MODEL : FREE_MODEL;

    const response = await client.responses.create({
      model: selectedModel,
      tools: [{ type: 'web_search_preview' }],
      input: [{ role: 'user', content: input }],
      text: {
        format: {
          type: 'json_schema',
          name: 'dealcheck_report',
          strict: true,
          schema
        }
      }
    });

    const report = normalizeReport(JSON.parse(response.output_text), price, currency);
    return res.status(200).json({ report, premium, modelTier: premium ? 'premium' : 'free' });
  } catch (err) {
    console.error(err);
    const code = err?.code || err?.type;
    if (code === 'insufficient_quota') {
      return res.status(402).json({ error: 'AI analysis quota is unavailable. Check the OpenAI billing/usage for the API project.' });
    }
    if (err?.status === 429) {
      return res.status(429).json({ error: 'The AI service is temporarily rate-limited. Please try again in a moment.' });
    }
    return res.status(500).json({ error: 'Analysis could not be completed. Try another product source or enter the product name and price manually.' });
  }
};
