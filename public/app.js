let stripe = null;
let stripeReady = null;
let elements = null;
let paymentElement = null;
let expressCheckoutElement = null;
let paymentIntentId = localStorage.getItem('dealcheck_payment_intent_id') || null;
let checkout = null;
let subscriptionId = localStorage.getItem('dealcheck_subscription_id') || null;
let customerId = localStorage.getItem('dealcheck_customer_id') || null;
let report = null;
let screenshotDataUrl = null;
let activeTab = 'url';

const $ = (id) => document.getElementById(id);
const uiText = (text) => window.PriceCheckrI18n ? PriceCheckrI18n.t(text) : text;
const uid = () => {
  const existing = localStorage.getItem('dealcheck_user_id');
  if (existing) return existing;
  const value = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
  localStorage.setItem('dealcheck_user_id', value);
  return value;
};
const userId = uid();

const state = {
  get user() { return JSON.parse(localStorage.getItem('dealcheck_user') || 'null'); },
  set user(v) { localStorage.setItem('dealcheck_user', JSON.stringify(v)); },
  get checks() { return JSON.parse(localStorage.getItem('dealcheck_checks') || '[]'); },
  set checks(v) { localStorage.setItem('dealcheck_checks', JSON.stringify(v)); },
  get wishlist() { return JSON.parse(localStorage.getItem('dealcheck_wishlist') || '[]'); },
  set wishlist(v) { localStorage.setItem('dealcheck_wishlist', JSON.stringify(v)); },
  get alerts() { return JSON.parse(localStorage.getItem('dealcheck_alerts') || '[]'); },
  set alerts(v) { localStorage.setItem('dealcheck_alerts', JSON.stringify(v)); }
};

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));
}
function safeUrl(value) {
  const raw = String(value ?? '').trim();
  // Internal API/image proxy URLs are safe to use as relative paths.
  if (raw.startsWith('/')) return raw;
  if (raw.startsWith('#')) return raw;
  try {
    const u = new URL(raw);
    return /^https?:$/.test(u.protocol) ? u.toString() : '#';
  } catch (_) { return '#'; }
}
function money(v, c) {
  if (v == null || Number.isNaN(Number(v))) return '—';
  return `${Number(v).toLocaleString(PriceCheckrI18n?.META?.[PriceCheckrI18n.getLocale?.() || 'en']?.intl || undefined, { maximumFractionDigits: 2 })} ${esc(c || '')}`.trim();
}
function fmtDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString(PriceCheckrI18n?.META?.[PriceCheckrI18n.getLocale?.() || 'en']?.intl || undefined, { month:'short', day:'numeric', year:'numeric' });
}
function toast(message, type='normal') {
  const el = $('toast');
  el.textContent = window.PriceCheckrI18n ? PriceCheckrI18n.t(message) : message;
  el.className = `toast ${type}`;
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => el.classList.add('hidden'), 3200);
}
function track(name, data={}) {
  const events = JSON.parse(localStorage.getItem('dealcheck_events') || '[]');
  events.push({ name, at: new Date().toISOString(), ...data });
  localStorage.setItem('dealcheck_events', JSON.stringify(events.slice(-500)));
}
function isPremium() { return localStorage.getItem('dealcheck_premium') === 'true'; }

function setPremiumState(data) {
  const premium = Boolean(data?.premium);
  localStorage.setItem('dealcheck_premium', premium ? 'true' : 'false');
  if (data?.subscriptionId) {
    subscriptionId = data.subscriptionId;
    localStorage.setItem('dealcheck_subscription_id', data.subscriptionId);
  }
  if (data?.customerId) {
    customerId = data.customerId;
    localStorage.setItem('dealcheck_customer_id', data.customerId);
  }
  if (data?.email || data?.name) {
    const old = state.user || {};
    state.user = {
      ...old,
      email: data.email || old.email || '',
      name: data.name || old.name || '',
      createdAt: old.createdAt || new Date().toISOString()
    };
  }
  return premium;
}

async function refreshPremiumStatus() {
  const params = new URLSearchParams();
  if (subscriptionId) params.set('subscriptionId', subscriptionId);
  else if (customerId) params.set('customerId', customerId);
  else {
    const savedSession = localStorage.getItem('dealcheck_checkout_session_id') || '';
    if (savedSession) params.set('sessionId', savedSession);
  }
  if (!params.toString()) {
    localStorage.setItem('dealcheck_premium', 'false');
    return false;
  }

  try {
    const r = await fetch(`/api/subscription-status?${params.toString()}`, { cache: 'no-store' });
    if (!r.ok) {
      localStorage.setItem('dealcheck_premium', 'false');
      return false;
    }
    const data = await r.json();
    return setPremiumState(data);
  } catch (_) {
    localStorage.setItem('dealcheck_premium', 'false');
    return false;
  }
}

async function initStripe() {
  try {
    const r = await fetch('/api/config', { cache: 'no-store' });
    const cfg = await r.json();
    if (!r.ok) throw new Error(cfg.error || 'Could not load Stripe configuration.');
    if (!cfg.stripePublishableKey) throw new Error('Stripe publishable key is missing. Add DEALCHECK_STRIPE_PK or NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in Vercel.');
    if (!window.Stripe) throw new Error('Stripe.js has not finished loading.');
    const instance = window.Stripe(cfg.stripePublishableKey);
    if (!instance) throw new Error('Stripe could not be initialized. Check that the publishable key is a valid Stripe key for this environment.');
    stripe = instance;
    return stripe;
  } catch (err) {
    console.error('Stripe initialization failed:', err);
    stripe = null;
    throw err;
  }
}
stripeReady = initStripe().catch(() => null);

function closeMobileMenu() {
  const nav = $('mobileNav');
  const button = $('mobileMenu');
  if (!nav) return;
  nav.classList.remove('open');
  nav.setAttribute('aria-hidden', 'true');
  if (button) {
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open navigation');
    button.textContent = uiText('☰');
  }
}
window.closeMobileMenu = closeMobileMenu;
function toggleMobileMenu(force) {
  const nav = $('mobileNav');
  const button = $('mobileMenu');
  if (!nav) return;
  const open = typeof force === 'boolean' ? force : !nav.classList.contains('open');
  nav.classList.toggle('open', open);
  nav.setAttribute('aria-hidden', String(!open));
  if (button) {
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    button.textContent = open ? '×' : '☰';
  }
}
function navigate(view='home') {
  closeMobileMenu();
  document.querySelectorAll('[data-view]').forEach(el => el.classList.toggle('active', el.dataset.view === view));
  document.querySelectorAll('.screen').forEach(el => el.classList.toggle('hidden', el.id !== `screen-${view}`));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (view === 'dashboard') renderDashboard();
  if (view === 'checks') renderChecks();
  if (view === 'wishlist') renderWishlist();
  if (view === 'alerts') renderAlerts();
  if (view === 'account') renderAccount();
}
window.navigate = navigate;

document.querySelectorAll('[data-view]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    navigate(el.dataset.view);
  });
});
$('mobileMenu')?.addEventListener('click', (e) => { e.stopPropagation(); toggleMobileMenu(); });
document.addEventListener('click', (e) => {
  const nav = $('mobileNav');
  const button = $('mobileMenu');
  if (nav?.classList.contains('open') && !nav.contains(e.target) && !button?.contains(e.target)) closeMobileMenu();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobileMenu();
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 720) closeMobileMenu();
});

document.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  btn.classList.add('active');
  activeTab = btn.dataset.tab;
  $('urlPane').classList.toggle('hidden', activeTab !== 'url');
  $('shotPane').classList.toggle('hidden', activeTab !== 'shot');
}));
$('shotInput').addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 5_000_000) {
    toast('Please choose an image under 5 MB.', 'error');
    e.target.value = '';
    return;
  }
  $('shotName').textContent = file.name;
  const reader = new FileReader();
  reader.onload = () => { screenshotDataUrl = reader.result; };
  reader.readAsDataURL(file);
});
const COUNTRY_TO_CURRENCY = {
  US:'USD', EU:'EUR', GB:'GBP', IN:'INR', CA:'CAD', AU:'AUD', NZ:'NZD',
  JP:'JPY', SG:'SGD', AE:'AED', ZA:'ZAR', BR:'BRL', MX:'MXN', OTHER:'USD'
};
const COUNTRY_TO_MARKET = {
  US:'United States', EU:'Europe', GB:'United Kingdom', IN:'India', CA:'Canada',
  AU:'Australia', NZ:'New Zealand', JP:'Japan', SG:'Singapore', AE:'United Arab Emirates',
  ZA:'South Africa', BR:'Brazil', MX:'Mexico', OTHER:'International'
};
function marketForCountry(code) {
  return COUNTRY_TO_MARKET[code] || 'International';
}

// Once the user has touched the market/currency selects themselves, their
// choice always wins over auto-detection — geo-detection is a convenience
// prefill, never something that overrides an explicit selection.
let marketTouchedByUser = false;
$('country').addEventListener('change', () => {
  marketTouchedByUser = true;
  $('currency').value = COUNTRY_TO_CURRENCY[$('country').value] || 'USD';
  $('marketDetected').classList.add('hidden');
});
$('currency').addEventListener('change', () => { marketTouchedByUser = true; });

async function autoDetectMarket() {
  try {
    const r = await fetch('/api/geo', { cache: 'no-store' });
    if (!r.ok) return;
    const geo = await r.json();
    if (marketTouchedByUser) return;
    const countrySelect = $('country');
    const hasOption = [...countrySelect.options].some(o => o.value === geo.country);
    if (geo.detected && hasOption) {
      countrySelect.value = geo.country;
      $('currency').value = geo.currency || COUNTRY_TO_CURRENCY[geo.country] || 'USD';
      $('marketDetected').classList.remove('hidden');
    } else if (geo.currency) {
      // Country not in our explicit list (or detection unavailable) — at
      // least default the currency so the price the person types isn't
      // silently mislabeled as EUR.
      $('currency').value = geo.currency;
    }
  } catch (_) {
    // Silent fallback: manual selects remain fully usable.
  }
}
autoDetectMarket();

// True when the AI couldn't pin the exact product down from a link/screenshot
// (no title/brand/model/sku AND no supporting evidence) and the user hadn't
// already told us the product name manually. In that case the honest, useful
// move is to send the person straight to manual entry rather than showing a
// report full of dashes.
function isProductUnidentified(r, hadManualName) {
  if (hadManualName) return false;
  const p = r?.product || {};
  const noIdentity = !p.title && !p.brand && !p.model && !p.sku;
  const noEvidence = !(Array.isArray(r?.evidence) && r.evidence.length);
  return noIdentity && noEvidence;
}

function setIdentifyPrompt(show) {
  $('identifyNotice').classList.toggle('hidden', !show);
  $('manualSection').classList.toggle('manual-highlight', show);
  if (show) {
    $('identifyNotice').scrollIntoView({ behavior: 'smooth', block: 'center' });
    $('productName').focus();
  }
}

$('analyzeBtn').addEventListener('click', async () => {
  const url = $('urlInput').value.trim();
  const name = $('productName').value.trim();
  const price = $('manualPrice').value;
  const currency = $('currency').value;
  const country = $('country').value;
  localStorage.setItem('dealcheck_last_country', country);
  const market = marketForCountry(country);
  if (!url && !name && !screenshotDataUrl) {
    $('inputError').textContent = uiText('Add a product link, screenshot, or product name.');
    return;
  }
  if (!isPremium() && localStorage.getItem('dealcheck_free_used') === 'true') {
    $('inputError').textContent = '';
    track('free_limit_hit');
    openPaywall();
    return;
  }
  $('inputError').textContent = '';
  setIdentifyPrompt(false);
  $('loading').classList.remove('hidden');
  track('analysis_started');
  try {
    const resp = await fetch('/api/analyze', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        url, productName:name, price, currency, screenshotDataUrl, market, country,
        language: window.PriceCheckrI18n ? PriceCheckrI18n.getLocale() : 'en',
        subscriptionId: localStorage.getItem('dealcheck_subscription_id') || '',
        customerId: localStorage.getItem('dealcheck_customer_id') || '',
      })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Analysis failed.');
    report = prepareDisplayReport(data.report, { price, currency });
    await enrichReportImages(report, url);
    report._sourceUrl = url || report._sourceUrl || '';
    saveCheck(report, { url, name, price, currency, country });

    if (isProductUnidentified(report, Boolean(name))) {
      setIdentifyPrompt(true);
      $('loading').classList.add('hidden');
      return;
    }

    const verifiedPremium = data.premium || await refreshPremiumStatus();
    if (verifiedPremium) {
      renderFull(report);
      track('premium_result');
    } else {
      renderFree(report);
      localStorage.setItem('dealcheck_free_used', 'true');
      $('resultSection').classList.remove('hidden');
      track('free_result');
      $('resultSection').scrollIntoView({ behavior:'smooth', block:'start' });
    }
  } catch (e) {
    $('inputError').textContent = e.message || uiText('Analysis failed. Try another source.');
  } finally {
    $('loading').classList.add('hidden');
  }
});

function saveCheck(r, input={}) {
  const p = r.product || {};
  const check = {
    id: `check_${Date.now()}`,
    createdAt: new Date().toISOString(),
    report: r,
    input
  };
  const checks = state.checks;
  checks.unshift(check);
  state.checks = checks.slice(0, 50);
  return check;
}

function productTitle(r) {
  const p = r?.product || {};
  return p.title || [p.brand, p.model].filter(Boolean).join(' ') || 'Product';
}


function prepareDisplayReport(r, input={}) {
  const out = JSON.parse(JSON.stringify(r || {}));
  out.product = out.product || {};
  const inputPrice = Number(input.price);
  if (Number.isFinite(inputPrice) && inputPrice > 0) out.product.current_price = inputPrice;
  if (!out.product.currency) out.product.currency = input.currency || 'EUR';
  const current = Number(out.product.current_price);
  if (Number.isFinite(current) && current > 0) {
    if (!Number.isFinite(Number(out.fair_price_low)) || !Number.isFinite(Number(out.fair_price_high)) || Number(out.fair_price_low) <= 0 || Number(out.fair_price_high) <= 0) {
      out.fair_price_low = Number((current * 0.85).toFixed(2));
      out.fair_price_high = Number((current * 1.05).toFixed(2));
      out.fair_price_estimated = true;
    }
    if (!Number.isFinite(Number(out.overpayment_low)) || !Number.isFinite(Number(out.overpayment_high))) {
      out.overpayment_low = Number(Math.max(0, current - Number(out.fair_price_high)).toFixed(2));
      out.overpayment_high = Number(Math.max(0, current - Number(out.fair_price_low)).toFixed(2));
      out.overpayment_estimated = true;
    }
  }
  if (!Number.isFinite(Number(out.deal_score))) {
    const scores = Object.values(out.scores || {}).map(Number).filter(Number.isFinite);
    const candidate = Number.isFinite(Number(out.value_for_money)) ? Number(out.value_for_money) : scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : 50;
    out.deal_score = Math.max(0, Math.min(100, Math.round(candidate)));
    out.deal_score_estimated = true;
  }
  // Same rule as the backend: never leave an individual stat blank. A
  // dimension with no real basis gets the overall score as a clearly-flagged
  // placeholder, never an invented specific rating.
  out.scores = out.scores && typeof out.scores === 'object' ? out.scores : {};
  let anyScoreEstimated = Boolean(out.scores_estimated);
  for (const key of ['performance','build','features','reliability','price_value']) {
    if (!Number.isFinite(Number(out.scores[key]))) {
      out.scores[key] = out.deal_score;
      anyScoreEstimated = true;
    }
  }
  out.scores_estimated = anyScoreEstimated;
  if (!Number.isFinite(Number(out.value_for_money))) {
    out.value_for_money = out.deal_score;
    out.value_for_money_estimated = true;
  }
  return out;
}

// When the model found no reliable comparable products, we still give the
// person a way to look at alternatives — real, live comparison searches for
// the exact product name/category, not invented competing products with
// made-up prices. This keeps the section from ever being empty without
// fabricating anything.
function fallbackAlternativeSearches(r) {
  const title = productTitle(r);
  if (!title || title === 'Product') return [];
  const q = encodeURIComponent(title);
  return [
    { label: 'Compare on Google Shopping', url: `https://www.google.com/search?tbm=shop&q=${q}` },
    { label: 'Search on Amazon', url: `https://www.amazon.com/s?k=${q}` },
    { label: 'Check camelcamelcamel price history', url: `https://camelcamelcamel.com/search?sq=${q}` }
  ];
}

function proxyImageUrl(url) {
  if (!url || !/^https?:\/\//i.test(String(url))) return url || '';
  return `/api/product-image?mode=proxy&url=${encodeURIComponent(url)}`;
}
async function resolveImage(pageUrl) {
  if (!pageUrl) return null;
  try {
    const r = await fetch(`/api/product-image?url=${encodeURIComponent(pageUrl)}`, {cache:'force-cache'});
    if (!r.ok) return null;
    const d = await r.json();
    return d.imageUrl ? proxyImageUrl(d.imageUrl) : null;
  } catch (_) { return null; }
}
function normalizeImageForDisplay(url) {
  if (!url) return '';
  const s = String(url).trim();
  if (s.startsWith('/api/product-image?')) return s;
  if (!/^https?:\/\//i.test(s)) return '';
  return proxyImageUrl(s);
}
async function enrichReportImages(r, sourceUrl='') {
  const out = r;
  out.product = out.product || {};
  const jobs = [];

  if (out.product.image_url) out.product.image_url = normalizeImageForDisplay(out.product.image_url);
  if (out.best_place_to_buy?.image_url) out.best_place_to_buy.image_url = normalizeImageForDisplay(out.best_place_to_buy.image_url);
  if (Array.isArray(out.alternatives)) {
    out.alternatives.slice(0,5).forEach(a => {
      if (a.image_url) a.image_url = normalizeImageForDisplay(a.image_url);
    });
  }

  if (!out.product.image_url && sourceUrl) jobs.push(resolveImage(sourceUrl).then(x => { if (x) out.product.image_url=x; }));
  if (!out.best_place_to_buy?.image_url && out.best_place_to_buy?.url) jobs.push(resolveImage(out.best_place_to_buy.url).then(x => { if (x) out.best_place_to_buy.image_url=x; }));
  if (Array.isArray(out.alternatives)) {
    out.alternatives.slice(0,5).forEach(a => {
      if (!a.image_url && a.url) jobs.push(resolveImage(a.url).then(x => { if (x) a.image_url=x; }));
    });
  }
  await Promise.allSettled(jobs);
  return out;
}
function imageFallback(title='Product') {
  const t = String(title || 'Product').trim();
  const words = t.split(/\s+/).filter(Boolean);
  const initials = (words.slice(0,2).map(w => w[0]).join('') || 'DC').toUpperCase();
  const lower = t.toLowerCase();
  const icon = /tv|television|monitor|display|screen/.test(lower) ? '▣' :
    /phone|iphone|pixel|galaxy|mobile/.test(lower) ? '▯' :
    /headphone|earbud|airpod/.test(lower) ? '◉' :
    /laptop|macbook|notebook|computer/.test(lower) ? '▱' :
    /watch/.test(lower) ? '◌' :
    /camera/.test(lower) ? '◍' :
    /shoe|sneaker/.test(lower) ? '⌁' : '✦';
  return `<div class="image-fallback-art"><span class="fallback-icon">${icon}</span><b>${esc(initials)}</b><small>Product image</small></div>`;
}
function productImage(url, title='Product', cls='product-image') {
  const displayUrl = normalizeImageForDisplay(url);
  if (!displayUrl) return `<div class="${cls} image-placeholder" aria-label="${esc(title)}">${imageFallback(title)}</div>`;
  return `<div class="${cls} image-frame"><img src="${safeUrl(displayUrl)}" alt="${esc(title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('.${cls}')?.classList.add('image-failed');this.remove()"><div class="image-error-fallback">${imageFallback(title)}</div></div>`;
}

function scoreRing(score) {
  const n = score == null ? null : Math.round(Number(score));
  const value = n == null ? '—' : n;
  const label = n == null ? 'LIMITED' : n >= 85 ? 'STRONG DEAL' : n >= 70 ? 'GOOD DEAL' : n >= 50 ? 'FAIR' : 'WAIT';
  return `<div class="score-wrap"><div class="score-ring" style="--score:${n == null ? 0 : Math.max(0, Math.min(100,n))}"><div><strong>${esc(value)}</strong><span>/100</span></div></div><b class="score-label">${label}</b></div>`;
}

function evidenceCards(r) {
  return (r.evidence || []).slice(0,8).map(e => `
    <article class="evidence-card">
      <div class="row-between"><b>${esc(e.source)}</b><span class="tag">${esc(e.condition || 'Current')}</span></div>
      <div class="evidence-price">${money(e.price,e.currency)}</div>
      <p>${esc(e.match_note || '')}</p>
      ${e.seller ? `<small>${esc(e.seller)}</small>` : ''}
      ${e.url ? `<a class="text-link" href="${safeUrl(e.url)}" target="_blank" rel="noopener noreferrer">View source ↗</a>` : ''}
      ${e.timestamp ? `<small class="muted">Checked ${esc(e.timestamp)}</small>` : ''}
    </article>`).join('') || `<div class="empty-card"><h3>Limited price evidence</h3><p>We couldn't verify enough live sources to show a comparison. Verify the final price at checkout.</p></div>`;
}

function alternativeCards(r) {
  const real = (r.alternatives || []).slice(0,5).map(a => `
    <article class="alternative-card">
      ${productImage(a.image_url, a.title, 'alt-image')}
      <div class="alt-body">
        <div class="alt-top"><span class="tag">SMART ALTERNATIVE</span><span>${esc(a.similarity || '')}</span></div>
        <h3>${esc(a.title)}</h3>
        <strong class="alt-price">${money(a.price,a.currency)}</strong><span class="alt-value-note">Current offer</span>
        <p>${esc(a.reason)}</p>
        <small>${esc(a.retailer || 'Retailer not verified')}</small>
        ${a.url ? `<a class="button secondary small" href="${safeUrl(a.url)}" target="_blank" rel="noopener noreferrer">Check offer ↗</a>` : ''}
      </div>
    </article>`).join('');
  if (real) return real;
  return `<article class="alternative-card fallback-alt"><div class="alt-body"><div class="alt-top"><span class="tag">Explore</span></div><h3>No verified comparable product yet</h3><p>We won't invent an alternative. Compare the exact product using live shopping results instead.</p><div class="alt-links">${fallbackAlternativeSearches(r).map(s => `<a class="button secondary small" href="${safeUrl(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`).join('')}</div></div></article>`;
}

function renderFree(r) {
  r = prepareDisplayReport(r);
  const p = r.product || {};
  const fair = r.fair_price_low != null && r.fair_price_high != null;
  const over = r.overpayment_low != null && r.overpayment_high != null;
  const current = Number(p.current_price);
  const fairMid = fair ? (Number(r.fair_price_low) + Number(r.fair_price_high)) / 2 : null;
  const likelyOverpay = over && Number.isFinite(current) && Number.isFinite(fairMid) && current > fairMid;
  const target = r.suggested_target_price != null ? money(r.suggested_target_price,p.currency) : 'Target price';
  const savings = likelyOverpay && r.overpayment_high != null ? money(r.overpayment_high,p.currency) : null;
  $('freeResult').innerHTML = `
    <div class="report-shell free-report">
      <div class="report-head product-hero">
        <div class="product-hero-copy">
          <div class="eyebrow">YOUR FREE CHECK</div>
          <h2>${esc(productTitle(r))}</h2>
          <p class="muted">${esc([p.brand && p.model ? `${p.brand} ${p.model}` : '', p.seller, r.market].filter(Boolean).join(' · '))}</p>
          <div class="decision-chip ${likelyOverpay ? 'wait' : 'fair'}">${likelyOverpay ? '⚠ PRICE DESERVES A SECOND LOOK' : '✓ INITIAL PRICE SIGNAL'}</div>
        </div>
        ${productImage(p.image_url, productTitle(r), 'hero-product-image')}
        ${scoreRing(r.deal_score)}
      </div>
      <div class="decision-banner ${likelyOverpay ? 'warning' : 'positive'}">
        <div><span>${likelyOverpay ? 'POTENTIAL OVERPAYMENT' : 'INITIAL SIGNAL'}</span><strong>${likelyOverpay ? `You may be paying ${savings || 'more than the fair range suggests'}.` : 'The first market signal does not show a clear pricing problem.'}</strong><p>${esc(r.summary || 'We found enough information to give you an initial signal. Premium can go deeper.')}</p></div>
        <div class="decision-cta"><b>Want the full answer?</b><button class="button primary" onclick="openPaywall()">See the better deal →</button></div>
      </div>
      <div class="metric-grid">
        <div class="metric"><span>YOUR PRICE</span><strong>${money(p.current_price,p.currency)}</strong></div>
        <div class="metric"><span>FAIR MARKET RANGE</span><strong>${fair ? `${money(r.fair_price_low,p.currency)} — ${money(r.fair_price_high,p.currency)}` : 'Limited data'}</strong><small class="metric-note">${r.fair_price_estimated ? 'Estimate' : 'Market evidence'}</small></div>
        <div class="metric"><span>SMART TARGET</span><strong>${esc(target)}</strong><small class="metric-note">Premium can explain why</small></div>
      </div>
      <div class="free-highlights">
        <div><span>✓</span><div><b>What looks good</b><p>${esc((r.positives||[])[0] || 'No strong positive signal was verified yet.')}</p></div></div>
        <div><span>!</span><div><b>What to consider</b><p>${esc((r.concerns||[])[0] || 'No major concern was verified yet.')}</p></div></div>
      </div>
      <div class="premium-teaser">
        <div class="teaser-heading"><span class="eyebrow">PREMIUM REVEALS THE PURCHASE</span><h3>We found more. You decide.</h3><p>The free check tells you whether to look closer. Premium shows where to buy, what to compare and what price makes sense.</p></div>
        <div class="locked-report-grid">
          <article class="locked-card visual-lock">${productImage(p.image_url,'Best offer','locked-image')}<span>🔒 PREMIUM</span><h3>Best place to buy</h3><p>Real offer, seller, price and one-tap buying link.</p></article>
          <article class="locked-card visual-lock"><div class="fake-alt-stack"><span></span><span></span><span></span></div><span>🔒 PREMIUM</span><h3>Better alternatives</h3><p>Real comparable products with photos, prices and reasons.</p></article>
          <article class="locked-card visual-lock"><div class="risk-orb">!</div><span>🔒 PREMIUM</span><h3>Buying risks</h3><p>Seller, warranty, returns and the details worth checking.</p></article>
          <article class="locked-card visual-lock"><div class="target-preview">${esc(target)}</div><span>🔒 PREMIUM</span><h3>Your target price</h3><p>A clear price point that makes the decision easier.</p></article>
        </div>
        <div class="soft-paywall">
          <div class="paywall-icon">✦</div>
          <div><div class="eyebrow">ONE SIMPLE UPGRADE</div><h3>Know the better option before you pay.</h3><p>Unlock the complete buying decision for <b>$0.99 today</b>.</p><div class="offer-inline"><b><s>$2.99</s> $0.99 today</b><span>3-day Premium starter included</span></div></div>
          <button class="button primary" id="unlockInline" onclick="openPaywall()">Unlock Premium →</button>
        </div>
      </div>
    </div>`;
  $('unlockInline').onclick = openPaywall;
  track('paywall_view');
}

function renderFull(r) {
  r = prepareDisplayReport(r);
  const p = r.product || {};
  const best = r.best_place_to_buy || {};
  const current = Number(p.current_price);
  const bestPrice = Number(best.price);
  const savings = Number.isFinite(current) && Number.isFinite(bestPrice) && current > bestPrice ? current - bestPrice : null;
  const rec = String(r.recommendation || 'INSUFFICIENT DATA').toUpperCase();
  const recDisplay = {BUY:'Buy',WAIT:'Wait',COMPARE:'Compare','INSUFFICIENT DATA':'Insufficient data'}[rec] || rec;
  const recLabel = window.PriceCheckrI18n ? PriceCheckrI18n.t(recDisplay) : recDisplay;
  const recClass = rec.toLowerCase().replace(/\s+/g,'-');
  const target = r.suggested_target_price != null ? money(r.suggested_target_price,p.currency) : '—';
  $('fullReport').innerHTML = `
    <div class="report-shell premium-report">
      <div class="premium-hero">
        <div class="product-hero-copy"><div class="eyebrow">✦ PREMIUM BUYING REPORT</div><h2>${esc(productTitle(r))}</h2><p class="muted">${esc([p.brand && p.model ? `${p.brand} ${p.model}` : '', p.seller, r.market].filter(Boolean).join(' · '))}</p></div>
        ${productImage(p.image_url, productTitle(r), 'hero-product-image')}
        ${scoreRing(r.deal_score)}
      </div>
      <div class="recommendation ${recClass}">
        <div class="rec-main"><span>OUR RECOMMENDATION</span><strong>${esc(recLabel)}</strong><p>${esc(r.summary || '')}</p></div>
        <div class="rec-action">${rec === 'BUY' ? '<b>Looks ready to buy.</b>' : rec === 'WAIT' ? '<b>Waiting could make sense.</b>' : rec === 'COMPARE' ? '<b>Compare before paying.</b>' : '<b>Verify more before paying.</b>'}</div>
      </div>
      ${savings ? `<div class="savings-banner"><span>✦ POTENTIAL SAVING FOUND</span><strong>${money(savings,p.currency)}</strong><p>We found a current offer below the price you entered. Verify the final checkout total before buying.</p></div>` : ''}
      <div class="metric-grid five">
        <div class="metric"><span>YOUR PRICE</span><strong>${money(p.current_price,p.currency)}</strong></div>
        <div class="metric"><span>FAIR PRICE</span><strong>${money(r.fair_price_low,p.currency)} — ${money(r.fair_price_high,p.currency)}</strong><small class="metric-note">${r.fair_price_estimated ? 'Estimated' : 'Evidence-based'}</small></div>
        <div class="metric"><span>SMART TARGET</span><strong>${esc(target)}</strong></div>
        <div class="metric"><span>VALUE</span><strong>${r.value_for_money == null ? '—' : Math.round(r.value_for_money)+'/100'}</strong></div>
        <div class="metric"><span>CONFIDENCE</span><strong>${esc(r.confidence || 'Limited')}</strong></div>
      </div>

      <section class="report-section best-buy spotlight">
        <div class="section-label">01 · BEST CURRENT OFFER</div>
        <div class="best-buy-card">
          ${productImage(best.image_url || p.image_url, best.retailer || productTitle(r), 'best-buy-image')}
          <div class="best-buy-info"><span class="verified-badge">✓ EVIDENCE MATCH</span><h3>${esc(best.retailer || 'No verified winner')}</h3><p>${esc(best.seller || '')}</p><strong class="big-price">${money(best.price,best.currency || p.currency)}</strong><p class="best-reason">${esc(best.reason || 'No reliable current offer was strong enough to recommend.')}</p></div>
          <div class="best-buy-action">${best.url ? `<a class="button primary big" href="${safeUrl(best.url)}" target="_blank" rel="noopener noreferrer">Go to this offer ↗</a>` : '<span class="muted">No verified purchase link</span>'}<small>Check final price, shipping, tax, warranty and returns at checkout.</small></div>
        </div>
      </section>

      <section class="report-section">
        <div class="section-label">02 · PRICE POSITION</div>
        <div class="price-position">
          <div class="price-track"><div class="fair-zone"></div><span class="marker current-marker" style="left:${Math.max(2,Math.min(98,(current && r.fair_price_low ? ((current-Math.max(0,r.fair_price_low*.7))/(Math.max(r.fair_price_high*1.3,r.fair_price_low*1.01)-Math.max(0,r.fair_price_low*.7)))*100:50)))}%"><b>${money(current,p.currency)}</b></span></div>
          <div class="price-legend"><span>Below market</span><b>Fair range ${money(r.fair_price_low,p.currency)} — ${money(r.fair_price_high,p.currency)}</b><span>Above market</span></div>
        </div>
      </section>

      <section class="report-section">
        <div class="section-label">03 · WHY THIS SCORE</div>
        <div class="score-grid">${Object.entries(r.scores || {}).map(([k,v]) => `<div class="mini-score"><span>${esc(window.PriceCheckrI18n ? PriceCheckrI18n.keyLabel(k) : k.replace(/_/g,' '))}</span><b>${v == null ? '—' : Math.round(v)}</b><div class="bar"><i style="width:${v == null ? 0 : Math.max(0,Math.min(100,v))}%"></i></div></div>`).join('')}</div>
      </section>

      <section class="report-section purchase-path">
        <div class="section-label">04 · YOUR SIMPLE BUYING PATH</div>
        <div class="purchase-path-grid">
          <div class="path-card active"><span>01</span><b>Know your price</b><small>${money(p.current_price,p.currency)} today</small></div>
          <div class="path-card"><span>02</span><b>See the better offer</b><small>Current verified options</small></div>
          <div class="path-card"><span>03</span><b>Compare alternatives</b><small>Only materially comparable picks</small></div>
          <div class="path-card"><span>04</span><b>Buy with confidence</b><small>Verify final checkout details</small></div>
        </div>
      </section>

      <section class="report-section">
        <div class="section-label">05 · BETTER OPTIONS</div>
        <div class="alternative-grid">${alternativeCards(r)}</div>
      </section>

      <section class="report-section detail-columns">
        <div><div class="section-label">WHAT WE LIKE</div><ul class="clean-list">${(r.positives||[]).map(x=>`<li>${esc(x)}</li>`).join('') || '<li>Limited evidence.</li>'}</ul></div>
        <div><div class="section-label">WHAT TO CONSIDER</div><ul class="clean-list">${(r.concerns||[]).map(x=>`<li>${esc(x)}</li>`).join('') || '<li>No specific concern verified; this does not guarantee a clean bill of health.</li>'}</ul></div>
        <div><div class="section-label">BEFORE YOU BUY</div><ul class="clean-list">${(r.important_to_know||[]).map(x=>`<li>${esc(x)}</li>`).join('') || '<li>Verify seller, returns, warranty and final checkout total.</li>'}</ul></div>
      </section>

      <section class="report-section">
        <div class="row-between"><div class="section-label">06 · PRICE EVIDENCE</div><span class="muted">${(r.evidence||[]).length} source(s)</span></div>
        <div class="evidence-grid">${evidenceCards(r)}</div>
      </section>

      <section class="watch-card">
        <div><div class="eyebrow">SAVE THE DECISION</div><h3>Don't lose this deal.</h3><p>Save the product and set the price that would make you comfortable buying. Your watch list is stored on this device.</p></div>
        <div class="watch-actions"><button class="button primary" id="saveProductBtn">Save product</button><div class="target-row"><input id="targetPrice" type="number" step="0.01" placeholder="${r.suggested_target_price ?? 'Target price'}"><button class="button secondary" id="setTargetBtn">Set target</button></div></div>
      </section>
      <p class="disclaimer">DEALCHECK is an informational shopping assistant. It does not guarantee the lowest price, savings, authenticity, quality, safety, availability or final purchase terms. Always verify the final price, taxes, shipping, warranty, seller and return policy.</p>
    </div>`;
  $('fullReport').classList.remove('hidden');
  $('resultSection').classList.add('hidden');
  $('fullReport').scrollIntoView({ behavior:'smooth' });
  $('saveProductBtn').onclick = () => saveWishlist(r);
  $('setTargetBtn').onclick = () => setTarget(r);
  track('full_report_view');
}

function saveWishlist(r) {
  const p = r.product || {};
  if (!state.user) {
    openRegister(() => saveWishlist(r));
    return;
  }
  const items = state.wishlist;
  const key = `${p.title || ''}|${p.model || ''}|${p.seller || ''}`;
  if (!items.some(x => x.key === key)) {
    items.unshift({
      id:`wish_${Date.now()}`, key, createdAt:new Date().toISOString(),
      title:productTitle(r), currentPrice:p.current_price, currency:p.currency,
      seller:p.seller, imageUrl:p.image_url || '', sourceUrl:r._sourceUrl || '', targetPrice:r.suggested_target_price ?? null, report:r
    });
    state.wishlist = items;
  }
  toast('Product saved to your wishlist.', 'success');
  renderWishlist();
  track('save_product');
}
function setTarget(r) {
  const value = Number($('targetPrice').value);
  if (!Number.isFinite(value) || value <= 0) return toast('Enter a valid target price.', 'error');
  if (!state.user) return openRegister(() => setTarget(r));
  const items = state.wishlist;
  const p = r.product || {};
  const key = `${p.title || ''}|${p.model || ''}|${p.seller || ''}`;
  const idx = items.findIndex(x => x.key === key);
  if (idx < 0) {
    items.unshift({ id:`wish_${Date.now()}`, key, createdAt:new Date().toISOString(), title:productTitle(r), currentPrice:p.current_price, currency:p.currency, seller:p.seller, imageUrl:p.image_url || '', targetPrice:value, report:r });
  } else {
    items[idx].targetPrice = value;
  }
  state.wishlist = items;
  toast('Target price saved. Background alerts are coming with the monitoring backend.', 'success');
  track('price_watch', { value });
}

let paywallOpening = false;
async function openPaywall() {
  // Guard set BEFORE any await so a rapid double-click/double-tap can't
  // race past this check while the first call is still in flight — this is
  // what previously allowed a second PaymentIntent (and a second charge)
  // to be created if the button was pressed twice quickly.
  if (paywallOpening) return;
  paywallOpening = true;
  try {
    await openPaywallInner();
  } finally {
    paywallOpening = false;
  }
}

async function openPaywallInner() {
  // Never show the purchase screen to an already active Premium customer.
  if (await refreshPremiumStatus()) {
    if (report) renderFull(report);
    else toast('Premium is already active on this account.', 'success');
    return;
  }

  $('payModal').classList.remove('hidden');
  $('payError').textContent = '';
  track('paywall_open');
  const u = state.user;
  if (u) {
    $('customerName').value = u.name || '';
    $('email').value = u.email || '';
  }

  const ready = await stripeReady;
  if (!ready || !stripe) {
    $('payError').textContent = uiText('Secure checkout could not be initialized. Please refresh the page and try again.');
    return;
  }
  try {
    await mountPaymentForm();
  } catch (err) {
    $('payError').textContent = err.message || 'Secure payment could not be loaded.';
  }
}

function destroyPaymentElements() {
  try { paymentElement?.unmount(); } catch (_) {}
  try { expressCheckoutElement?.unmount(); } catch (_) {}
  paymentElement = null;
  expressCheckoutElement = null;
  elements = null;
  $('paymentElement') && ($('paymentElement').innerHTML = '');
  $('expressCheckoutElement') && ($('expressCheckoutElement').innerHTML = '');
  $('expressCheckoutWrap')?.classList.add('hidden');
  $('walletDivider')?.classList.add('hidden');
}

$('closeModal').onclick = () => {
  destroyPaymentElements();
  $('payModal').classList.add('hidden');
};
$('notNow').onclick = () => {
  destroyPaymentElements();
  $('payModal').classList.add('hidden');
};

let mountingPaymentForm = false;
async function mountPaymentForm() {
  // Two guards: `elements` catches the normal "already mounted" case, but
  // `mountingPaymentForm` is set synchronously and catches a second call
  // that arrives while the first is still awaiting the network request
  // (before `elements` gets assigned) — that gap is what let a duplicate
  // PaymentIntent get created and charged.
  if (elements || mountingPaymentForm) return;
  mountingPaymentForm = true;
  try {
    const name = $('customerName').value.trim();
    const email = $('email').value.trim().toLowerCase();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      $('payError').textContent = uiText('Enter your full name and a valid email.');
      return;
    }

    $('payBtn').disabled = true;
    $('payBtn').textContent = uiText('Preparing secure payment…');

    // A stable per-browser-session key so that even if this request is ever
    // retried (flaky network, double dispatch, etc.) the backend returns the
    // SAME PaymentIntent instead of creating a second one.
    const intentAttemptKey = getOrCreateIntentAttemptKey(email);

    const resp = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name, email, userId, intentAttemptKey })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Could not start payment.');

    currentPaymentIntentClientSecret = data.clientSecret;
    paymentIntentId = data.paymentIntentId;
    customerId = data.customerId;
    localStorage.setItem('dealcheck_payment_intent_id', paymentIntentId);
    localStorage.setItem('dealcheck_customer_id', customerId);
    localStorage.setItem('dealcheck_checkout_email', email);
    localStorage.setItem('dealcheck_checkout_name', name);

    const appearance = {
      theme: 'stripe',
      variables: {
        colorPrimary: '#171715',
        colorText: '#171715',
        colorTextSecondary: '#777168',
        colorBackground: '#ffffff',
        borderRadius: '12px',
        fontFamily: 'inherit'
      },
      rules: {
        '.Input': { border: '1px solid #ddd8ce', boxShadow: 'none' },
        '.Label': { fontWeight: '700' }
      }
    };

    elements = stripe.elements({
      clientSecret: data.clientSecret,
      appearance,
      locale: window.PriceCheckrI18n?.META?.[window.PriceCheckrI18n.getLocale?.() || 'en']?.html || 'auto'
    });

    paymentElement = elements.create('payment', {
      layout: { type: 'accordion', defaultCollapsed: false, radios: 'always', spacedAccordionItems: false },
      defaultValues: { billingDetails: { name, email } }
    });
    paymentElement.mount('#paymentElement');

    expressCheckoutElement = elements.create('expressCheckout', {
      buttonType: {
        applePay: 'buy',
        googlePay: 'buy',
        link: 'pay',
        paypal: 'pay'
      },
      layout: { maxColumns: 1, maxRows: 1, overflow: 'never' },
      buttonHeight: 55
    });
    expressCheckoutElement.on('confirm', async () => {
      await confirmStarterPayment();
    });
    expressCheckoutElement.on('ready', ({availablePaymentMethods}) => {
      const hasWallet = availablePaymentMethods && Object.values(availablePaymentMethods).some(Boolean);
      $('expressCheckoutWrap').classList.toggle('hidden', !hasWallet);
      $('walletDivider').classList.toggle('hidden', !hasWallet);
    });
    expressCheckoutElement.mount('#expressCheckoutElement');

    $('payBtn').disabled = false;
    $('payBtn').textContent = uiText('Pay $0.99 and start trial →');
  } finally {
    mountingPaymentForm = false;
  }
}

function getOrCreateIntentAttemptKey(email) {
  const storageKey = 'dealcheck_intent_attempt_key';
  let key = sessionStorage.getItem(storageKey);
  if (!key) {
    key = `${userId}-${(crypto.randomUUID ? crypto.randomUUID() : String(Date.now()))}`;
    sessionStorage.setItem(storageKey, key);
  }
  return key;
}

let confirmingPayment = false;
async function confirmStarterPayment() {
  // Guards both the Apple Pay/Google Pay express button and the card "Pay"
  // button funnelling into the same PaymentIntent — without this, a confirm
  // event firing twice (e.g. wallet sheet + form submit close together)
  // could attempt two confirmations in flight at once.
  if (!elements || !paymentIntentId || confirmingPayment) return;
  confirmingPayment = true;
  $('payBtn').disabled = true;
  $('payBtn').textContent = uiText('Confirming payment…');
  $('payError').textContent = '';
  try {
    const { error: submitError } = await elements.submit();
    if (submitError) throw submitError;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${window.location.pathname}?payment_intent_return=1`
      },
      redirect: 'if_required'
    });
    if (error) throw error;

    const result = await stripe.retrievePaymentIntent(
      new URLSearchParams(window.location.search).get('payment_intent_client_secret') || getStoredClientSecret()
    ).catch(() => ({ paymentIntent: null }));

    if (result?.paymentIntent?.id) paymentIntentId = result.paymentIntent.id;
    const status = result?.paymentIntent?.status;
    if (status && status !== 'succeeded') {
      throw new Error(status === 'processing' ? 'Payment is processing. Please wait a moment.' : 'Payment could not be completed.');
    }

    await activatePremiumAfterPayment();
  } catch (err) {
    $('payError').textContent = err.message || 'Payment could not be completed. Please try again.';
    $('payBtn').disabled = false;
    $('payBtn').textContent = uiText('Pay $0.99 and start trial →');
  } finally {
    confirmingPayment = false;
  }
}

// The client secret is intentionally kept only in memory when possible. This
// fallback lets a redirected SCA/wallet flow finish without exposing it in app storage.
let currentPaymentIntentClientSecret = null;
function getStoredClientSecret() {
  return currentPaymentIntentClientSecret;
}

async function activatePremiumAfterPayment() {
  const name = $('customerName').value.trim() || localStorage.getItem('dealcheck_checkout_name') || '';
  const email = $('email').value.trim().toLowerCase() || localStorage.getItem('dealcheck_checkout_email') || '';
  const r = await fetch('/api/activate-subscription', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ paymentIntentId, customerId, userId })
  });
  const d = await r.json();
  if (!r.ok || !d.premium) throw new Error(d.error || 'Payment succeeded, but Premium is still being activated.');

  subscriptionId = d.subscriptionId;
  customerId = d.customerId;
  localStorage.setItem('dealcheck_subscription_id', subscriptionId || '');
  localStorage.setItem('dealcheck_customer_id', customerId || '');
  localStorage.setItem('dealcheck_premium', 'true');
  state.user = { name, email, createdAt: state.user?.createdAt || new Date().toISOString() };
  localStorage.setItem('dealcheck_free_used', 'true');
  track('payment_success', { offer:'0.99_today_3_day_trial_35_month' });

  destroyPaymentElements();
  $('payModal').classList.add('hidden');
  updateHeader();
  if (report) renderFull(report);
  toast('Premium is active. Your full report is unlocked.', 'success');
}

$('paymentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!elements) {
    try { await mountPaymentForm(); } catch (err) { $('payError').textContent = err.message; }
    return;
  }
  await confirmStarterPayment();
});

async function resumePaymentFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const pi = params.get('payment_intent');
  const clientSecret = params.get('payment_intent_client_secret');
  if (!pi || !clientSecret) return;
  paymentIntentId = pi;
  currentPaymentIntentClientSecret = clientSecret;
  customerId = localStorage.getItem('dealcheck_customer_id') || null;
  try {
    const result = await stripe.retrievePaymentIntent(clientSecret);
    if (result.error) throw result.error;
    if (result.paymentIntent?.status === 'succeeded') {
      await activatePremiumAfterPayment();
      window.history.replaceState({}, '', window.location.pathname);
    }
  } catch (err) {
    console.error('Payment return handling failed:', err);
  }
}

async function resumeCheckoutFromUrl() {
  await resumePaymentFromUrl();
}

function openRegister(callback) {
  window.__registerCallback = callback;
  $('registerModal').classList.remove('hidden');
  $('registerEmail').value = state.user?.email || '';
}
$('closeRegister').onclick = () => $('registerModal').classList.add('hidden');
$('registerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = $('registerEmail').value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    $('registerError').textContent = uiText('Enter a valid email.');
    return;
  }
  state.user = { email, createdAt: state.user?.createdAt || new Date().toISOString() };
  $('registerModal').classList.add('hidden');
  updateHeader();
  if (window.__registerCallback) window.__registerCallback();
});

function updateHeader() {
  const user = state.user;
  $('accountButton').textContent = user ? (user.name || user.email.split('@')[0]) : 'Account';
  $('accountDot').classList.toggle('hidden', !user);
}

function renderDashboard() {
  const checks = state.checks;
  const wish = state.wishlist;
  const alerts = state.alerts;
  const potential = wish.reduce((sum,x) => {
    const p = Number(x.currentPrice), t = Number(x.targetPrice);
    return sum + (Number.isFinite(p) && Number.isFinite(t) && p > t ? p-t : 0);
  }, 0);
  $('dashboardContent').innerHTML = `
    <div class="page-heading"><div><div class="eyebrow">YOUR DASHBOARD</div><h1>Stay ahead of your next purchase.</h1><p>Everything you save in DEALCHECK lives here on this device.</p></div><button class="button primary" onclick="navigate('home')">Check a product</button></div>
    <div class="stat-grid">
      <div class="stat-card"><span>Total checks</span><strong>${checks.length}</strong><small>Analyses saved</small></div>
      <div class="stat-card"><span>Saved products</span><strong>${wish.length}</strong><small>Wishlist</small></div>
      <div class="stat-card"><span>Active targets</span><strong>${wish.filter(x=>x.targetPrice).length}</strong><small>Price targets</small></div>
      <div class="stat-card"><span>Potential savings</span><strong>${potential ? money(potential,'') : '—'}</strong><small>Estimated only</small></div>
    </div>
    <div class="dashboard-grid">
      <div class="panel"><div class="row-between"><h2>Recent checks</h2><button class="text-button" onclick="navigate('checks')">View all</button></div>${checks.slice(0,4).map(x=>checkRow(x)).join('') || emptyState('No checks yet.','Start with a product you are considering.')}</div>
      <div class="panel premium-panel"><div class="eyebrow">PREMIUM</div><h2>${isPremium() ? 'Your Premium access is active.' : 'Make every important purchase count.'}</h2><p>Unlimited checking, saved history, alternatives and price targets are designed to turn one analysis into an ongoing buying habit.</p>${isPremium() ? '<span class="status-pill success">Active subscription</span>' : '<button class="button primary" onclick="openPaywall()">Unlock Premium — $0.99 today</button>'}</div>
    </div>`;
}

function checkRow(x) {
  const r=x.report||{}, p=r.product||{}, rec=String(r.recommendation||'—').toUpperCase();
  return `<article class="check-row"><div class="check-thumb">${productImage(p.image_url, productTitle(r), 'row-product-image')}</div><div class="check-main"><b>${esc(productTitle(r))}</b><span>${esc(rec)} · ${esc(r.market||'')}</span><small>${fmtDate(x.createdAt)} · ${money(p.current_price,p.currency)}</small></div><strong class="row-score">${r.deal_score==null?'—':Math.round(r.deal_score)}</strong></article>`;
}

function renderChecks() {
  $('checksContent').innerHTML = `<div class="page-heading"><div><div class="eyebrow">MY CHECKS</div><h1>Your analysis history.</h1><p>Saved reports and recent product checks.</p></div><button class="button primary" onclick="navigate('home')">New check</button></div><div class="panel">${state.checks.map(checkRow).join('') || emptyState('No saved checks yet.','Your first analysis will appear here.')}</div>`;
}
function renderWishlist() {
  $('wishlistContent').innerHTML = `<div class="page-heading"><div><div class="eyebrow">WISHLIST</div><h1>Products worth waiting for.</h1><p>Keep your target prices close so buying feels simple when the right moment arrives.</p></div><button class="button primary" onclick="navigate('home')">Find another deal →</button></div><div class="wishlist-grid">${state.wishlist.map((x,i)=>`<article class="wish-card">${productImage(x.imageUrl,x.title,'wish-image')}<div class="row-between"><span class="tag">Saved</span><button class="icon-button" onclick="removeWish(${i})">×</button></div><h3>${esc(x.title)}</h3><p>${esc(x.seller || 'Seller not specified')}</p><div class="wish-price">${money(x.currentPrice,x.currency)}</div><div class="wish-target"><span>Target</span><b>${x.targetPrice ? money(x.targetPrice,x.currency) : 'Not set'}</b></div><label>Set target price</label><div class="target-row"><input id="wish-${i}" type="number" step="0.01" value="${x.targetPrice ?? ''}" placeholder="e.g. 299"><button class="button secondary" onclick="updateWishTarget(${i})">Save</button></div><small class="muted">Saved ${fmtDate(x.createdAt)}</small></article>`).join('') || emptyState('Your wishlist is empty.','Save a product after a Premium report.')}</div>`;
}

window.removeWish = (i) => { const x=state.wishlist; x.splice(i,1); state.wishlist=x; renderWishlist(); };
window.updateWishTarget = (i) => { const v=Number($(`wish-${i}`).value); if(!Number.isFinite(v)||v<=0)return toast('Enter a valid target price.','error'); const x=state.wishlist; x[i].targetPrice=v; state.wishlist=x; toast('Target price updated.','success'); renderWishlist(); };
function renderAlerts() {
  $('alertsContent').innerHTML = `<div class="page-heading"><div><div class="eyebrow">PRICE ALERTS</div><h1>Know when your target is reached.</h1><p>Set a target, then check your saved offers whenever you want. This device can also show a browser notification while DEALCHECK is open.</p></div><button class="button primary" onclick="requestAlertPermission()">Enable notifications</button></div><div class="notice"><b>How alerts work on this device</b><p>Because your current plan stores data locally, automatic checks can run while this page is open. We never pretend a background check happened when it didn't. A future backend can make monitoring fully continuous.</p></div><div class="alert-list">${state.wishlist.map((x,i)=>x.targetPrice ? `<div class="alert-row"><div class="alert-product"><div class="alert-thumb">${productImage(x.imageUrl,x.title,'alert-image')}</div><div><b>${esc(x.title)}</b><span>Target ${money(x.targetPrice,x.currency)} · Current ${money(x.currentPrice,x.currency)}</span></div></div><div class="alert-actions"><span class="status-pill ${Number(x.currentPrice)<=Number(x.targetPrice)?'success':''}">${Number(x.currentPrice)<=Number(x.targetPrice)?'Target reached':'Watching'}</span><button class="button secondary small" onclick="checkSavedPrice(${i})">Check now</button></div></div>` : '').join('') || emptyState('No price targets yet.','Save a product and set a target after a Premium report.')}</div>`;
}
window.requestAlertPermission = async () => {
  if (!('Notification' in window)) return toast('Browser notifications are not available on this device.', 'error');
  const permission = await Notification.requestPermission();
  toast(permission === 'granted' ? 'Notifications enabled on this device.' : 'Notifications were not enabled.', permission === 'granted' ? 'success' : 'normal');
};
window.checkSavedPrice = async (index) => {
  const item = state.wishlist[index];
  if (!item) return;
  const url = item.sourceUrl || item.report?._sourceUrl || item.report?.best_place_to_buy?.url || '';
  if (!url) return toast('This saved product has no source link to check.', 'error');
  toast('Checking the latest available evidence…');
  try {
    const r = await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      url, productName:item.title, price:'', currency:item.currency || 'USD',
      screenshotDataUrl:null, market:marketForCountry(localStorage.getItem('dealcheck_last_country') || 'OTHER'),
      country:localStorage.getItem('dealcheck_last_country') || 'OTHER',
      language: window.PriceCheckrI18n ? PriceCheckrI18n.getLocale() : 'en',
      subscriptionId:localStorage.getItem('dealcheck_subscription_id') || '',
      customerId:localStorage.getItem('dealcheck_customer_id') || '',
    })});
    const d=await r.json(); if(!r.ok) throw Error(d.error||'Could not check this product.');
    if(!d.premium) throw Error('Premium verification is required for price monitoring.');
    const updated=prepareDisplayReport(d.report,{});
    await enrichReportImages(updated,url);
    item.currentPrice=updated.product?.current_price ?? item.currentPrice;
    item.report=updated; item.imageUrl=updated.product?.image_url || item.imageUrl || '';
    item.lastCheckedAt=new Date().toISOString();
    state.wishlist[index]=item; state.wishlist=state.wishlist;
    if(Number(item.currentPrice)<=Number(item.targetPrice) && 'Notification' in window && Notification.permission==='granted'){
      new Notification(window.PriceCheckrI18n ? PriceCheckrI18n.t('Target reached') : 'DEALCHECK: target reached',{body:`${item.title} — ${money(item.currentPrice,item.currency)} · ${window.PriceCheckrI18n ? PriceCheckrI18n.t('Target price') : 'Target price'}`});
    }
    toast(Number(item.currentPrice)<=Number(item.targetPrice)?'Target price reached. Nice timing.':'Price checked and watch updated.','success');
    renderAlerts();
  } catch(e){ toast(e.message || 'Could not check this product.','error'); }
};

function renderAccount() {
  const u=state.user;
  $('accountContent').innerHTML = `<div class="page-heading"><div><div class="eyebrow">ACCOUNT & SUBSCRIPTION</div><h1>Your profile.</h1><p>Keep your email and billing access in one place.</p></div></div><div class="account-grid"><div class="panel"><div class="profile-avatar">${u ? esc(u.email[0].toUpperCase()) : '?'}</div><h2>${u ? esc(u.email) : 'No account yet'}</h2><p class="muted">${u ? `${esc(u.email)} · Email profile` : 'Your profile is created automatically after your first Premium payment.'}</p>${u ? '<button class="button secondary" id="editEmail">Change email</button>' : '<button class="button primary" id="createProfile">Create profile</button>'}</div><div class="panel"><div class="eyebrow">SUBSCRIPTION</div><h2>${isPremium() ? 'Premium active' : 'Free plan'}</h2><p>${isPremium() ? 'Your Premium access is active. Manage billing securely through Stripe.' : 'One complete first analysis is free. Premium starts with a $0.99 starter payment and a 3-day Premium trial.'}</p>${isPremium() && customerId ? '<button class="button secondary" id="manageBilling">Manage billing</button>' : '<button class="button primary" onclick="openPaywall()">Unlock Premium</button>'}<div id="billingError" class="error"></div></div></div><div class="legal-links"><a href="#terms" onclick="openLegal('terms')">Terms</a><a href="#privacy" onclick="openLegal('privacy')">Privacy</a><a href="#refund" onclick="openLegal('refund')">Refund & withdrawal</a><a href="mailto:support@dealcheck.example">Contact</a></div>`;
  if ($('createProfile')) $('createProfile').onclick=()=>openRegister();
  if ($('editEmail')) $('editEmail').onclick=()=>openRegister();
  if ($('manageBilling')) $('manageBilling').onclick=async()=>{ try { const r=await fetch('/api/create-portal-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customerId})}); const d=await r.json(); if(!r.ok)throw Error(d.error); window.location.href=d.url; } catch(e){ $('billingError').textContent=e.message; } };
}
function emptyState(title, text) { return `<div class="empty-card"><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`; }

window.openLegal = (kind) => {
  const content = window.PriceCheckrI18n ? PriceCheckrI18n.legal(kind) : ['', ''];
  $('legalTitle').textContent=content[0];
  $('legalText').textContent=content[1];
  $('legalModal').classList.remove('hidden');
};
$('closeLegal').onclick=()=>$('legalModal').classList.add('hidden');

$('accountButton').onclick=()=>navigate('account');

updateHeader();
track('landing_view');

// Restore Premium from Stripe on every page load. The browser flag is only a UI
// cache; the server verifies the real subscription status before Premium AI use.
(async () => {
  await refreshPremiumStatus();
  updateHeader();
  navigate('home');
  await resumeCheckoutFromUrl();
  if (!report && state.checks.length) report = state.checks[0].report;
  if (report && isPremium()) {
    await enrichReportImages(report, report._sourceUrl || '');
    renderFull(report);
  }
})();
