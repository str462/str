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
  try {
    const u = new URL(value);
    return /^https?:$/.test(u.protocol) ? u.toString() : '#';
  } catch (_) { return '#'; }
}
function money(v, c) {
  if (v == null || Number.isNaN(Number(v))) return '—';
  return `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${esc(c || '')}`.trim();
}
function fmtDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' });
}
function toast(message, type='normal') {
  const el = $('toast');
  el.textContent = message;
  el.className = `toast ${type}`;
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => el.classList.add('hidden'), 3200);
}
function track(name, data={}) {
  const events = JSON.parse(localStorage.getItem('dealcheck_events') || '[]');
  events.push({ name, at: new Date().toISOString(), ...data });
  localStorage.setItem('dealcheck_events', JSON.stringify(events.slice(-500)));
}
function isPremium() {
  return localStorage.getItem('dealcheck_premium') === 'true';
}

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
    if (!r.ok) return false;
    const data = await r.json();
    return setPremiumState(data);
  } catch (_) {
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

function navigate(view='home') {
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
$('mobileMenu')?.addEventListener('click', () => $('mobileNav').classList.toggle('hidden'));

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
$('country').addEventListener('change', () => {
  const map = { EU:'EUR', IN:'INR', GB:'GBP' };
  $('currency').value = map[$('country').value] || 'EUR';
});

$('analyzeBtn').addEventListener('click', async () => {
  const url = $('urlInput').value.trim();
  const name = $('productName').value.trim();
  const price = $('manualPrice').value;
  const currency = $('currency').value;
  const country = $('country').value;
  const market = country === 'IN' ? 'India' : country === 'GB' ? 'United Kingdom' : 'Europe';
  if (!url && !name && !screenshotDataUrl) {
    $('inputError').textContent = 'Add a product link, screenshot, or product name.';
    return;
  }
  $('inputError').textContent = '';
  $('loading').classList.remove('hidden');
  track('analysis_started');
  try {
    const resp = await fetch('/api/analyze', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        url, productName:name, price, currency, screenshotDataUrl, market, country,
        subscriptionId: localStorage.getItem('dealcheck_subscription_id') || '',
        customerId: localStorage.getItem('dealcheck_customer_id') || ''
      })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Analysis failed.');
    report = prepareDisplayReport(data.report, { price, currency });
    saveCheck(report, { url, name, price, currency, country });
    const verifiedPremium = data.premium || await refreshPremiumStatus();
    if (verifiedPremium) {
      renderFull(report);
      track('premium_result');
    } else {
      renderFree(report);
      $('resultSection').classList.remove('hidden');
      track('free_result');
      $('resultSection').scrollIntoView({ behavior:'smooth', block:'start' });
    }
  } catch (e) {
    $('inputError').textContent = e.message || 'Analysis failed. Try another source.';
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
  return out;
}

function scoreRing(score) {
  const value = score == null ? '—' : Math.round(score);
  return `<div class="score-ring" style="--score:${score == null ? 0 : Math.max(0, Math.min(100, Number(score)))}"><div><strong>${esc(value)}</strong><span>/100</span></div></div>`;
}

function evidenceCards(r) {
  return (r.evidence || []).slice(0, 8).map(e => `
    <article class="evidence-card">
      <div class="row-between"><b>${esc(e.source)}</b><span class="tag">${esc(e.condition || 'Current')}</span></div>
      <div class="evidence-price">${money(e.price,e.currency)}</div>
      <p>${esc(e.match_note || '')}</p>
      ${e.seller ? `<small>${esc(e.seller)}</small>` : ''}
      ${e.url ? `<a href="${safeUrl(e.url)}" target="_blank" rel="noopener noreferrer">View source ↗</a>` : ''}
      ${e.timestamp ? `<small class="muted">Checked ${esc(e.timestamp)}</small>` : ''}
    </article>`).join('');
}

function alternativeCards(r) {
  return (r.alternatives || []).slice(0,5).map(a => `
    <article class="alternative-card">
      <div class="alt-top"><span class="tag">Alternative</span><span>${esc(a.similarity || '')}</span></div>
      <h3>${esc(a.title)}</h3>
      <strong class="alt-price">${money(a.price,a.currency)}</strong>
      <p>${esc(a.reason)}</p>
      <small>${esc(a.retailer || 'Retailer not verified')}</small>
      ${a.url ? `<a href="${safeUrl(a.url)}" target="_blank" rel="noopener noreferrer">Check offer ↗</a>` : ''}
    </article>`).join('');

}

function renderFree(r) {
  r = prepareDisplayReport(r);
  const p = r.product || {};
  const fair = r.fair_price_low != null && r.fair_price_high != null;
  const over = r.overpayment_low != null && r.overpayment_high != null;
  const current = Number(p.current_price);
  const fairMid = fair ? (Number(r.fair_price_low) + Number(r.fair_price_high)) / 2 : null;
  const likelyOverpay = over && Number.isFinite(current) && Number.isFinite(fairMid) && current > fairMid;
  const teaserTarget = r.suggested_target_price != null ? money(r.suggested_target_price, p.currency) : 'A smarter target price';
  $('freeResult').innerHTML = `
    <div class="report-shell">
      <div class="report-head">
        <div>
          <div class="eyebrow">FREE FIRST ANALYSIS</div>
          <h2>${esc(productTitle(r))}</h2>
          <p class="muted">${esc([p.seller, r.market].filter(Boolean).join(' · '))}</p>
        </div>
        ${scoreRing(r.deal_score)}
      </div>
      ${r.restricted_category ? `
        <div class="notice danger"><b>Product category unavailable</b><p>${esc(r.restriction_note || 'This category cannot be analyzed here.')}</p></div>
      ` : ''}
      <div class="metric-grid">
        <div class="metric"><span>Current price</span><strong>${money(p.current_price,p.currency)}</strong></div>
        <div class="metric"><span>Estimated fair range</span><strong>${fair ? `${money(r.fair_price_low,p.currency)} — ${money(r.fair_price_high,p.currency)}` : '—'}</strong><small class="metric-note">${r.fair_price_estimated ? 'Estimated from available data' : 'Verified market range'}</small></div>
        <div class="metric"><span>Potential overpayment</span><strong>${over ? `${money(r.overpayment_low,p.currency)} — ${money(r.overpayment_high,p.currency)}` : '—'}</strong><small class="metric-note">${r.overpayment_estimated ? 'Estimated' : 'Based on verified range'}</small></div>
      </div>
      <div class="free-verdict ${likelyOverpay ? 'warning' : 'positive'}">
        <span>${likelyOverpay ? 'PRICE SIGNAL' : 'INITIAL SIGNAL'}</span>
        <strong>${likelyOverpay ? `This price may be higher than the market range.` : 'The first evidence does not show a clear pricing problem.'}</strong>
        <p>${esc(r.summary || 'The available evidence is not strong enough for a confident conclusion.')}</p>
      </div>
      <div class="two-col">
        <div><h3>What looks good</h3><ul>${(r.positives||[]).slice(0,2).map(x=>`<li>${esc(x)}</li>`).join('') || '<li>No strong positive signal was verified yet.</li>'}</ul></div>
        <div><h3>What to consider</h3><ul>${(r.concerns||[]).slice(0,2).map(x=>`<li>${esc(x)}</li>`).join('') || '<li>No major concern was verified yet.</li>'}</ul></div>
      </div>

      <div class="locked-report-grid">
        <article class="locked-card"><div class="lock-icon">⌁</div><span>LOCKED</span><h3>Where should you buy it?</h3><p>The strongest verified retailer, current price and seller notes are waiting in Premium.</p><div class="blur-line"></div><div class="blur-line short"></div></article>
        <article class="locked-card"><div class="lock-icon">◇</div><span>LOCKED</span><h3>Are there better alternatives?</h3><p>We compare materially similar products and reveal the strongest value alternatives when evidence exists.</p><div class="blur-line"></div><div class="blur-line short"></div></article>
        <article class="locked-card"><div class="lock-icon">!</div><span>LOCKED</span><h3>What could you regret?</h3><p>Unlock the complete concerns, important buying notes and seller-specific evidence.</p><div class="blur-line"></div><div class="blur-line short"></div></article>
        <article class="locked-card"><div class="lock-icon">↗</div><span>LOCKED</span><h3>Your target price</h3><p>Premium calculates a practical target and lets you save the product for future monitoring.</p><strong class="locked-price">${esc(teaserTarget)}</strong></article>
      </div>

      <div class="soft-paywall">
        <div class="paywall-icon">✦</div>
        <div>
          <div class="eyebrow">DEALCHECK PREMIUM</div>
          <h3>Don't make the expensive part of the decision blind.</h3>
          <p>Your free scan shows the signal. Premium shows the evidence behind it: where to buy, alternatives, hidden concerns, score breakdown and the price worth waiting for.</p>
          <div class="offer-inline"><b><s>$2.99</s> $0.99 today</b><span>3-day Premium starter</span></div>
        </div>
        <button class="button primary" id="unlockInline">Unlock Premium →</button>
      </div>
    </div>`;
  $('unlockInline').onclick = openPaywall;
  track('paywall_view');
}

function renderFull(r) {
  r = prepareDisplayReport(r);
  const p = r.product || {};
  const best = r.best_place_to_buy || {};
  $('fullReport').innerHTML = `
    <div class="report-shell premium-report">
      <div class="report-head">
        <div>
          <div class="eyebrow">PREMIUM REPORT</div>
          <h2>${esc(productTitle(r))}</h2>
          <p class="muted">${esc([p.seller, r.market].filter(Boolean).join(' · '))}</p>
        </div>
        ${scoreRing(r.deal_score)}
      </div>
      <div class="recommendation ${esc((r.recommendation||'').toLowerCase())}">
        <span>Recommendation</span><strong>${esc(r.recommendation || 'INSUFFICIENT DATA')}</strong>
        <p>${esc(r.summary || '')}</p>
      </div>
      <div class="metric-grid five">
        <div class="metric"><span>Current price</span><strong>${money(p.current_price,p.currency)}</strong></div>
        <div class="metric"><span>Fair price</span><strong>${money(r.fair_price_low,p.currency)} — ${money(r.fair_price_high,p.currency)}</strong><small class="metric-note">${r.fair_price_estimated ? 'Estimated' : 'Verified market range'}</small></div>
        <div class="metric"><span>Potential overpayment</span><strong>${r.overpayment_low == null ? '—' : `${money(r.overpayment_low,p.currency)} — ${money(r.overpayment_high,p.currency)}`}</strong><small class="metric-note">${r.overpayment_estimated ? 'Estimated' : 'Based on verified range'}</small></div>
        <div class="metric"><span>Value for money</span><strong>${r.value_for_money == null ? '—' : `${Math.round(r.value_for_money)}/100`}</strong></div>
        <div class="metric"><span>Evidence confidence</span><strong>${esc(r.confidence || 'Unknown')}</strong></div>
      </div>

      <section class="report-section best-buy">
        <div class="section-label">BEST PLACE TO BUY</div>
        <div class="best-buy-grid">
          <div>
            <h3>${esc(best.retailer || 'No verified winner')}</h3>
            <p>${esc(best.seller || '')}</p>
            <strong class="big-price">${money(best.price,best.currency)}</strong>
          </div>
          <div>
            <p>${esc(best.reason || 'No reliable current offer was strong enough to recommend.')}</p>
            ${best.url ? `<a class="button secondary" href="${safeUrl(best.url)}" target="_blank" rel="noopener noreferrer">Open verified offer ↗</a>` : ''}
          </div>
        </div>
      </section>

      <section class="report-section">
        <div class="section-label">VALUE BREAKDOWN</div>
        <div class="score-grid">
          ${Object.entries(r.scores || {}).map(([k,v]) => `<div class="mini-score"><span>${esc(k.replace(/_/g,' '))}</span><b>${v == null ? '—' : Math.round(v)}</b><div class="bar"><i style="width:${v == null ? 0 : Math.max(0,Math.min(100,v))}%"></i></div></div>`).join('')}
        </div>
      </section>

      <section class="report-section">
        <div class="section-label">WHAT WE LIKE</div>
        <ul class="clean-list">${(r.positives||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
      </section>

      <section class="report-section">
        <div class="section-label">WHAT TO CONSIDER</div>
        <ul class="clean-list">${(r.concerns||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
      </section>

      <section class="report-section">
        <div class="section-label">IMPORTANT BEFORE BUYING</div>
        <ul class="clean-list">${(r.important_to_know||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
        ${r.seller_notes ? `<div class="notice"><b>Seller/source note</b><p>${esc(r.seller_notes)}</p></div>` : ''}
      </section>

      <section class="report-section">
        <div class="row-between"><div class="section-label">PRICE EVIDENCE</div><span class="muted">${(r.evidence||[]).length} source(s)</span></div>
        <div class="evidence-grid">${evidenceCards(r)}</div>
      </section>

      <section class="report-section">
        <div class="row-between"><div class="section-label">BETTER-VALUE ALTERNATIVES</div><span class="muted">Only shown when a reliable match exists</span></div>
        <div class="alternative-grid">${alternativeCards(r) || '<div class="empty-card">No reliable alternative was found for this exact use case.</div>'}</div>
      </section>

      <section class="watch-card">
        <div>
          <div class="eyebrow">SAVE & WATCH</div>
          <h3>Protect your next purchase</h3>
          <p>Save this product and set a target price. This MVP stores your target on this device; continuous background notifications will be added with the monitoring backend.</p>
        </div>
        <div class="watch-actions">
          <button class="button primary" id="saveProductBtn">Save product</button>
          <div class="target-row"><input id="targetPrice" type="number" step="0.01" placeholder="${r.suggested_target_price ?? 'Target price'}"><button class="button secondary" id="setTargetBtn">Set target</button></div>
        </div>
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
      seller:p.seller, targetPrice:r.suggested_target_price ?? null, report:r
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
    items.unshift({ id:`wish_${Date.now()}`, key, createdAt:new Date().toISOString(), title:productTitle(r), currentPrice:p.current_price, currency:p.currency, seller:p.seller, targetPrice:value, report:r });
  } else {
    items[idx].targetPrice = value;
  }
  state.wishlist = items;
  toast('Target price saved. Background alerts are coming with the monitoring backend.', 'success');
  track('price_watch', { value });
}

async function openPaywall() {
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
    $('payError').textContent = 'Secure checkout could not be initialized. Please refresh the page and try again.';
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

async function mountPaymentForm() {
  if (elements) return;
  const name = $('customerName').value.trim();
  const email = $('email').value.trim().toLowerCase();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    $('payError').textContent = 'Enter your full name and a valid email.';
    return;
  }

  $('payBtn').disabled = true;
  $('payBtn').textContent = 'Preparing secure payment…';

  const resp = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ name, email, userId })
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
    locale: 'auto'
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
    buttonHeight: 52
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
  $('payBtn').textContent = 'Pay $0.99 and start trial →';
}

async function confirmStarterPayment() {
  if (!elements || !paymentIntentId) return;
  $('payBtn').disabled = true;
  $('payBtn').textContent = 'Confirming payment…';
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
    $('payBtn').textContent = 'Pay $0.99 and start trial →';
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
    $('registerError').textContent = 'Enter a valid email.';
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
  return `<button class="list-row" onclick="openCheck('${x.id}')"><div><b>${esc(productTitle(x.report))}</b><span>${fmtDate(x.createdAt)}</span></div><strong>${x.report?.deal_score == null ? '—' : Math.round(x.report.deal_score)}/100</strong></button>`;
}
window.openCheck = (id) => {
  const item = state.checks.find(x=>x.id===id);
  if (!item) return;
  report = item.report;
  navigate('home');
  if (isPremium()) renderFull(report);
  else {
    $('resultSection').classList.remove('hidden');
    renderFree(report);
    navigate('home');
    $('resultSection').scrollIntoView({behavior:'smooth'});
  }
};

function renderChecks() {
  $('checksContent').innerHTML = `<div class="page-heading"><div><div class="eyebrow">MY CHECKS</div><h1>Your analysis history.</h1><p>Saved reports and recent product checks.</p></div><button class="button primary" onclick="navigate('home')">New check</button></div><div class="panel">${state.checks.map(checkRow).join('') || emptyState('No saved checks yet.','Your first analysis will appear here.')}</div>`;
}
function renderWishlist() {
  $('wishlistContent').innerHTML = `<div class="page-heading"><div><div class="eyebrow">WISHLIST</div><h1>Products worth watching.</h1><p>Save products and keep your target prices in one place.</p></div></div><div class="wishlist-grid">${state.wishlist.map((x,i)=>`<article class="wish-card"><div class="row-between"><span class="tag">Saved</span><button class="icon-button" onclick="removeWish(${i})">×</button></div><h3>${esc(x.title)}</h3><p>${esc(x.seller || 'Seller not specified')}</p><div class="wish-price">${money(x.currentPrice,x.currency)}</div><label>Target price</label><div class="target-row"><input id="wish-${i}" type="number" step="0.01" value="${x.targetPrice ?? ''}" placeholder="Set target"><button class="button secondary" onclick="updateWishTarget(${i})">Save</button></div><small class="muted">Saved ${fmtDate(x.createdAt)}</small></article>`).join('') || emptyState('Your wishlist is empty.','Save a product after a Premium report.')}</div>`;
}
window.removeWish = (i) => { const x=state.wishlist; x.splice(i,1); state.wishlist=x; renderWishlist(); };
window.updateWishTarget = (i) => { const v=Number($(`wish-${i}`).value); if(!Number.isFinite(v)||v<=0)return toast('Enter a valid target price.','error'); const x=state.wishlist; x[i].targetPrice=v; state.wishlist=x; toast('Target price updated.','success'); renderWishlist(); };
function renderAlerts() {
  $('alertsContent').innerHTML = `<div class="page-heading"><div><div class="eyebrow">PRICE ALERTS</div><h1>Know when your target is reached.</h1><p>Target prices are stored now. Automated background checking and notifications require the next monitoring backend.</p></div></div><div class="notice"><b>Monitoring status</b><p>This MVP does not promise continuous monitoring. When the monitoring service is connected, DEALCHECK can check saved products and notify you when a target is reached or the price materially drops.</p></div><div class="alert-list">${state.wishlist.filter(x=>x.targetPrice).map(x=>`<div class="alert-row"><div><b>${esc(x.title)}</b><span>Target ${money(x.targetPrice,x.currency)}</span></div><span class="status-pill">Target saved</span></div>`).join('') || emptyState('No price targets yet.','Set a target from a Premium report or your wishlist.')}</div>`;
}
function renderAccount() {
  const u=state.user;
  $('accountContent').innerHTML = `<div class="page-heading"><div><div class="eyebrow">ACCOUNT & SUBSCRIPTION</div><h1>Your profile.</h1><p>Keep your email and billing access in one place.</p></div></div><div class="account-grid"><div class="panel"><div class="profile-avatar">${u ? esc(u.email[0].toUpperCase()) : '?'}</div><h2>${u ? esc(u.email) : 'No account yet'}</h2><p class="muted">${u ? `${esc(u.email)} · Email profile` : 'Your profile is created automatically after your first Premium payment.'}</p>${u ? '<button class="button secondary" id="editEmail">Change email</button>' : '<button class="button primary" id="createProfile">Create profile</button>'}</div><div class="panel"><div class="eyebrow">SUBSCRIPTION</div><h2>${isPremium() ? 'Premium active' : 'Free plan'}</h2><p>${isPremium() ? 'Your Premium access is active. Your 3-day starter period is followed by $35/month billing. Manage billing through Stripe.' : 'One complete first analysis is free. Premium starts at $0.99 today for 3 days, then $35/month until canceled.'}</p>${isPremium() && customerId ? '<button class="button secondary" id="manageBilling">Manage billing</button>' : '<button class="button primary" onclick="openPaywall()">Unlock Premium</button>'}<div id="billingError" class="error"></div></div></div><div class="legal-links"><a href="#terms" onclick="openLegal('terms')">Terms</a><a href="#privacy" onclick="openLegal('privacy')">Privacy</a><a href="#refund" onclick="openLegal('refund')">Refund & withdrawal</a><a href="mailto:support@dealcheck.example">Contact</a></div>`;
  if ($('createProfile')) $('createProfile').onclick=()=>openRegister();
  if ($('editEmail')) $('editEmail').onclick=()=>openRegister();
  if ($('manageBilling')) $('manageBilling').onclick=async()=>{ try { const r=await fetch('/api/create-portal-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customerId})}); const d=await r.json(); if(!r.ok)throw Error(d.error); window.location.href=d.url; } catch(e){ $('billingError').textContent=e.message; } };
}
function emptyState(title, text) { return `<div class="empty-card"><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`; }

window.openLegal = (kind) => {
  const content = {
    terms: ['Terms of Use','DEALCHECK provides informational shopping analysis. It does not guarantee the lowest price, savings, authenticity, quality, safety, availability or purchase outcome. Verify final price, seller, taxes, shipping, warranty and return terms before buying. Premium is a recurring digital subscription billed by Stripe and may be canceled according to the subscription terms.'],
    privacy: ['Privacy','DEALCHECK should collect only the information needed to provide the service, such as an email address and required Stripe identifiers. Raw card details are handled by Stripe and are not stored by DEALCHECK. Product inputs and reports may be stored to provide account/history features. This page is a product draft and should be reviewed for the final legal entity and jurisdictions before launch.'],
    refund: ['Refund & withdrawal','Customers may cancel recurring subscriptions to stop future renewals. Refund and withdrawal rights depend on applicable law and the published policy. For EU/EEA consumers, digital-service withdrawal rules can include exceptions when service performance starts after the required consent and acknowledgment. Requests should be handled through the published support process. This draft is not legal advice.']
  }[kind];
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
  if (report && isPremium()) renderFull(report);
})();
