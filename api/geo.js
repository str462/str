// Vercel automatically attaches geolocation headers to every request at the
// edge (x-vercel-ip-country, -country-region, -city) — no external API, no
// extra cost, no client-side permission prompt. This endpoint turns that
// into a currency + market suggestion the frontend can use to prefill the
// checker form. If the headers are absent (local dev, some self-hosting),
// it falls back to a neutral default and the user can still pick manually.

const COUNTRY_TABLE = {
  US: { currency: 'USD', market: 'United States' },
  CA: { currency: 'CAD', market: 'Canada' },
  GB: { currency: 'GBP', market: 'United Kingdom' },
  IE: { currency: 'EUR', market: 'Europe' },
  AU: { currency: 'AUD', market: 'Australia' },
  NZ: { currency: 'NZD', market: 'New Zealand' },
  IN: { currency: 'INR', market: 'India' },
  DE: { currency: 'EUR', market: 'Europe' },
  FR: { currency: 'EUR', market: 'Europe' },
  ES: { currency: 'EUR', market: 'Europe' },
  IT: { currency: 'EUR', market: 'Europe' },
  NL: { currency: 'EUR', market: 'Europe' },
  BE: { currency: 'EUR', market: 'Europe' },
  AT: { currency: 'EUR', market: 'Europe' },
  PT: { currency: 'EUR', market: 'Europe' },
  PL: { currency: 'PLN', market: 'Europe' },
  SE: { currency: 'SEK', market: 'Europe' },
  NO: { currency: 'NOK', market: 'Europe' },
  DK: { currency: 'DKK', market: 'Europe' },
  CH: { currency: 'CHF', market: 'Europe' },
  UA: { currency: 'UAH', market: 'Europe' },
  RO: { currency: 'RON', market: 'Europe' },
  CZ: { currency: 'CZK', market: 'Europe' },
  JP: { currency: 'JPY', market: 'Japan' },
  SG: { currency: 'SGD', market: 'Singapore' },
  AE: { currency: 'AED', market: 'United Arab Emirates' },
  ZA: { currency: 'ZAR', market: 'South Africa' },
  BR: { currency: 'BRL', market: 'Brazil' },
  MX: { currency: 'MXN', market: 'Mexico' }
};

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const country = String(req.headers['x-vercel-ip-country'] || '').toUpperCase() || null;
  const region = req.headers['x-vercel-ip-country-region'] || null;
  const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : null;

  const match = country && COUNTRY_TABLE[country];
  return res.status(200).json({
    country: country || null,
    region,
    city,
    currency: match ? match.currency : 'USD',
    market: match ? match.market : (country ? country : 'International'),
    detected: Boolean(match)
  });
};
