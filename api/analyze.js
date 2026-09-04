const OpenAI = require('openai');
const Stripe = require('stripe');

function getOpenAIClient() {
  const key = String(process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY is not configured. Add a valid OpenAI API key in Vercel Environment Variables.');
  return new OpenAI({ apiKey: key });
}
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Free scans use a lower-cost model. Verified Premium customers use the
// higher-quality model. Both can be overridden in Vercel environment variables.
// Keep environment variables as the source of truth, but use API model IDs
// that are known to be supported by the Responses API as safe fallbacks.
// A ChatGPT model name should never be assumed to be an API model ID.
const FREE_MODEL = process.env.OPENAI_FREE_MODEL || 'gpt-5-mini';
const PREMIUM_MODEL = process.env.OPENAI_PREMIUM_MODEL || process.env.OPENAI_MODEL || 'gpt-5.1';
const SAFE_FREE_MODEL = 'gpt-5-mini';
const SAFE_PREMIUM_MODEL = 'gpt-5.1';
const SUPPORTED_LANGUAGES = {
  en: 'English', de: 'Deutsch', fr: 'Français', es: 'Español', it: 'Italiano', nl: 'Nederlands', pl: 'Polski'
};
function normalizeLanguage(value) {
  const key = String(value || 'en').toLowerCase().split('-')[0];
  return Object.prototype.hasOwnProperty.call(SUPPORTED_LANGUAGES, key) ? key : 'en';
}
const API_ERRORS = {
  'Add a product link, screenshot, or product name.': {
    de:'Füge einen Produktlink, Screenshot oder Produktnamen hinzu.', fr:'Ajoutez un lien produit, une capture d’écran ou un nom de produit.', es:'Añade un enlace, una captura o un nombre de producto.', it:'Inserisci un link, uno screenshot o il nome del prodotto.', nl:'Voeg een productlink, screenshot of productnaam toe.', pl:'Dodaj link do produktu, zrzut ekranu lub nazwę produktu.'
  },
  'Enter a valid product price.': {de:'Gib einen gültigen Produktpreis ein.',fr:'Saisissez un prix de produit valide.',es:'Introduce un precio de producto válido.',it:'Inserisci un prezzo del prodotto valido.',nl:'Voer een geldige productprijs in.',pl:'Wprowadź prawidłową cenę produktu.'},
  'That screenshot is too large. Please upload a smaller image.': {de:'Der Screenshot ist zu groß. Bitte lade ein kleineres Bild hoch.',fr:'Cette capture est trop volumineuse. Importez une image plus petite.',es:'La captura es demasiado grande. Sube una imagen más pequeña.',it:'Lo screenshot è troppo grande. Carica un’immagine più piccola.',nl:'De screenshot is te groot. Upload een kleinere afbeelding.',pl:'Ten zrzut ekranu jest za duży. Prześlij mniejszy obraz.'},
  'AI analysis quota is unavailable. Check the OpenAI billing/usage for the API project.': {de:'Das Kontingent für die KI-Analyse ist nicht verfügbar. Prüfe die OpenAI-Abrechnung und Nutzung.',fr:'Le quota d’analyse IA est indisponible. Vérifiez la facturation et l’utilisation OpenAI.',es:'La cuota de análisis de IA no está disponible. Comprueba la facturación y el uso de OpenAI.',it:'La quota per l’analisi IA non è disponibile. Controlla fatturazione e utilizzo OpenAI.',nl:'Het quotum voor AI-analyse is niet beschikbaar. Controleer de OpenAI-facturatie en het gebruik.',pl:'Limit analizy AI jest niedostępny. Sprawdź rozliczenia i wykorzystanie OpenAI.'},
  'The AI service is temporarily rate-limited. Please try again in a moment.': {de:'Der KI-Dienst ist vorübergehend ausgelastet. Bitte versuche es gleich erneut.',fr:'Le service IA est temporairement limité. Réessayez dans un instant.',es:'El servicio de IA está temporalmente limitado. Inténtalo de nuevo en un momento.',it:'Il servizio IA è temporaneamente limitato. Riprova tra poco.',nl:'De AI-service is tijdelijk beperkt. Probeer het zo opnieuw.',pl:'Usługa AI jest tymczasowo ograniczona. Spróbuj ponownie za chwilę.'},
  'Analysis could not be completed. Try another product source or enter the product name and price manually.': {de:'Die Analyse konnte nicht abgeschlossen werden. Versuche eine andere Produktquelle oder gib Name und Preis manuell ein.',fr:'L’analyse n’a pas pu être terminée. Essayez une autre source ou saisissez manuellement le nom et le prix.',es:'No se pudo completar el análisis. Prueba otra fuente o introduce manualmente el nombre y el precio.',it:'L’analisi non può essere completata. Prova un’altra fonte o inserisci manualmente nome e prezzo.',nl:'De analyse kon niet worden voltooid. Probeer een andere bron of voer naam en prijs handmatig in.',pl:'Nie udało się ukończyć analizy. Spróbuj innego źródła lub wpisz ręcznie nazwę i cenę.'}
};
function localizeApiError(message, lang) {
  if (lang === 'en') return message;
  return API_ERRORS[message]?.[lang] || message;
}


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
        image_url: { type: ['string', 'null'] },
        seller: { type: ['string', 'null'] },
        availability: { type: ['string', 'null'] },
        currency: { type: ['string', 'null'] },
        current_price: { type: ['number', 'null'] }
      },
      required: ['title','brand','model','sku','image_url','seller','availability','currency','current_price']
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
        reason: { type: 'string' },
        image_url: { type: ['string','null'] }
      },
      required: ['retailer','seller','price','currency','url','reason','image_url']
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
          image_url: { type: ['string','null'] },
          reason: { type: 'string' },
          similarity: { type: 'string' }
        },
        required: ['title','brand','model','price','currency','retailer','url','image_url','reason','similarity']
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
  let raw = String(value).trim();
  if (!raw) return null;

  // Users commonly paste domains without a scheme (amazon.com/...).
  // Treat those as HTTPS instead of rejecting an otherwise valid product URL.
  if (raw.startsWith('//')) raw = `https:${raw}`;
  else if (!/^[a-z][a-z0-9+.-]*:/i.test(raw)) raw = `https://${raw}`;

  try {
    const u = new URL(raw);
    if (!/^https?:$/.test(u.protocol)) return null;
    if (!u.hostname || !u.hostname.includes('.')) return null;
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
  if (!Object.prototype.hasOwnProperty.call(r.product, 'image_url')) r.product.image_url = null;
  if (r.best_place_to_buy && !Object.prototype.hasOwnProperty.call(r.best_place_to_buy, 'image_url')) r.best_place_to_buy.image_url = null;
  if (Array.isArray(r.alternatives)) r.alternatives.forEach(a => { if (!Object.prototype.hasOwnProperty.call(a, 'image_url')) a.image_url = null; });

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

  // The value/score breakdown must never render as a wall of dashes. Where the
  // model genuinely had no basis to rate a specific dimension (performance,
  // build, etc.), we don't invent a claim about that dimension — we fill it
  // with the same overall deal_score and flag it as an overall estimate, so
  // the UI can label it "estimated from overall score" instead of showing
  // nothing. This is a transparent placeholder value, never a fabricated
  // specific fault or advantage.
  r.scores = r.scores && typeof r.scores === 'object' ? r.scores : {};
  const scoreKeys = ['performance', 'build', 'features', 'reliability', 'price_value'];
  let anyScoreEstimated = false;
  for (const key of scoreKeys) {
    if (finiteNumber(r.scores[key]) == null) {
      r.scores[key] = r.deal_score;
      anyScoreEstimated = true;
    }
  }
  if (anyScoreEstimated) r.scores_estimated = true;

  if (finiteNumber(r.value_for_money) == null) {
    r.value_for_money = r.deal_score;
    r.value_for_money_estimated = true;
  }
  if (finiteNumber(r.purchase_confidence) == null) {
    r.purchase_confidence = r.deal_score;
    r.purchase_confidence_estimated = true;
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

  let language = 'en';
  try {
    const body = req.body || {};
    language = normalizeLanguage(body.language);
    const url = cleanUrl(body.url);
    const productName = String(body.productName || '').trim().slice(0, 300);
    const price = body.price === '' || body.price == null ? null : Number(body.price);
    const currency = String(body.currency || 'EUR').toUpperCase();
    const market = String(body.market || 'Europe').slice(0, 40);
    const country = String(body.country || 'EU').slice(0, 60);
    const screenshotDataUrl = typeof body.screenshotDataUrl === 'string' ? body.screenshotDataUrl : null;
    const languageName = SUPPORTED_LANGUAGES[language];

    if (!url && !productName && !screenshotDataUrl) {
      return res.status(400).json({ error: localizeApiError('Add a product link, screenshot, or product name.', language) });
    }
    if (price != null && (!Number.isFinite(price) || price < 0)) {
      return res.status(400).json({ error: localizeApiError('Enter a valid product price.', language) });
    }
    if (screenshotDataUrl && screenshotDataUrl.length > 7_000_000) {
      return res.status(413).json({ error: localizeApiError('That screenshot is too large. Please upload a smaller image.', language) });
    }

    const instructions = `
You are DEALCHECK, an AI shopping decision assistant.

OUTPUT LANGUAGE: ${languageName} (${language}). Every human-readable assessment field in the JSON must be written naturally in this language: summary, recommendation explanation, positives, concerns, important_to_know, seller_notes, evidence match_note, best_place_to_buy.reason, alternatives.reason and similarity/confidence text. Product names, brands, models, SKUs, retailer names, seller names, source names and URLs must remain in their original form. Do not translate proper product or brand names. The recommendation field MUST remain one of the exact English enum values: BUY, WAIT, COMPARE, INSUFFICIENT DATA, because the frontend localizes that label.

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
- Never invent a retailer, price, URL, image URL, review, specification or alternative.
- For image_url, return only a real publicly accessible product-image URL you actually observed on the product/retailer page or search evidence; otherwise return null.
- Premium reports must be shopping-ready: identify the exact variant first, then find current offers and 3–5 materially comparable alternatives when evidence supports them.
- For every recommended offer or alternative with a product page, try to capture its real product image URL from the page/search evidence. Never substitute a logo, generic category image, stock image or unrelated product.
- Prefer clean product photography (the product itself on a neutral/white background) over banners, logos, review photos or lifestyle hero images.
- A product/alternative without reliable current evidence should be omitted rather than padded to reach a number.
- For alternatives, explain the practical trade-off in one sentence: cheaper, better value, better feature set, or better seller/availability. Do not recommend an inferior product solely because it costs less.
- If evidence is weak, return nulls and lower confidence. Do not manufacture a fair-price range or overpayment number.
- The screenshot is evidence, not proof of the whole market.
- If a product is restricted/prohibited in the user's country/region or should not be analyzed under platform/payment/safety rules, set restricted_category=true and explain briefly. Do not provide purchasing guidance for it.
- Do not make unsupported claims of fraud, counterfeit, safety defects, authenticity or guaranteed savings.
- The best_place_to_buy must be the strongest VERIFIED current offer among the evidence, balancing price, seller reliability, availability and variant match. If no reliable winner exists, use nulls and explain why.
- alternatives should contain 3–5 materially comparable products only when reliable current evidence exists. Aim for 3 strong options when possible, but never fabricate or pad the list. Do not recommend an alternative just because it is cheaper.
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

    const client = getOpenAIClient();
    let response;
    try {
      response = await client.responses.create({
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
    } catch (err) {
      const modelMissing = err?.status === 404 || err?.code === 'model_not_found' || /model.*(not found|does not exist|not available)/i.test(String(err?.message || ''));
      if (!modelMissing) throw err;

      const fallbackModel = premium ? SAFE_PREMIUM_MODEL : SAFE_FREE_MODEL;
      if (selectedModel === fallbackModel) throw err;
      console.warn(`Configured OpenAI model '${selectedModel}' was unavailable; retrying with '${fallbackModel}'.`);
      response = await client.responses.create({
        model: fallbackModel,
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
    }

    const report = normalizeReport(JSON.parse(response.output_text), price, currency);
    return res.status(200).json({ report, premium, modelTier: premium ? 'premium' : 'free' });
  } catch (err) {
    console.error(err);
    const code = err?.code || err?.type;
    if (code === 'insufficient_quota') {
      return res.status(402).json({ error: localizeApiError('AI analysis quota is unavailable. Check the OpenAI billing/usage for the API project.', language) });
    }
    if (err?.status === 401 || code === 'invalid_api_key') {
      return res.status(401).json({ error: 'The OpenAI API key was rejected. Check OPENAI_API_KEY in Vercel.' });
    }
    if (err?.status === 403) {
      return res.status(403).json({ error: 'The OpenAI API key does not have permission to use this API/model. Check the OpenAI project and key permissions.' });
    }
    if (err?.status === 429) {
      return res.status(429).json({ error: localizeApiError('The AI service is temporarily rate-limited. Please try again in a moment.', language) });
    }
    return res.status(500).json({ error: localizeApiError('Analysis could not be completed. Try another product source or enter the product name and price manually.', language) });
  }
};
