const dns = require('dns').promises;
const net = require('net');

function blockedIp(ip) {
  if (net.isIP(ip) === 4) {
    const [a,b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a === 0;
  }
  if (net.isIP(ip) === 6) {
    const x = ip.toLowerCase();
    return x === '::1' || x.startsWith('fc') || x.startsWith('fd') || x.startsWith('fe80:');
  }
  return true;
}
async function isPublicHost(hostname) {
  const h = String(hostname || '').toLowerCase();
  if (h === 'localhost' || h.endsWith('.local') || net.isIP(h)) return !blockedIp(h);
  try {
    const records = await dns.lookup(h, { all: true });
    return records.length > 0 && records.every(r => !blockedIp(r.address));
  } catch (_) { return false; }
}
function absolute(base, value) {
  try {
    const v = String(value || '').trim();
    if (!v || v.startsWith('data:') || v.startsWith('javascript:')) return null;
    const u = new URL(v, base);
    return /^https?:$/.test(u.protocol) ? u.toString() : null;
  } catch (_) { return null; }
}
function unescapeHtml(s) {
  return String(s || '').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#x27;/gi,"'");
}
function unique(arr) { return [...new Set(arr.filter(Boolean))]; }

function extractImageCandidates(html, baseUrl) {
  const candidates = [];
  const add = (v) => {
    const x = absolute(baseUrl, unescapeHtml(v));
    if (x) candidates.push(x);
  };

  // Open Graph / Twitter are the strongest signals.
  const meta = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/ig,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/ig,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/ig,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/ig
  ];
  for (const re of meta) { let m; while ((m = re.exec(html))) add(m[1]); }

  // JSON-LD Product.image is common on modern commerce sites.
  const scripts = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/ig) || [];
  for (const block of scripts.slice(0,20)) {
    const body = block.replace(/^<script[^>]*>/i,'').replace(/<\/script>$/i,'').trim();
    try {
      const data = JSON.parse(body);
      const stack = Array.isArray(data) ? data : [data];
      for (const obj of stack) {
        const walk = (x) => {
          if (!x || typeof x !== 'object') return;
          if (x.image) {
            const imgs = Array.isArray(x.image) ? x.image : [x.image];
            imgs.forEach(v => add(typeof v === 'string' ? v : v?.url));
          }
          Object.values(x).slice(0,40).forEach(walk);
        };
        walk(obj);
      }
    } catch (_) {}
  }

  const link = /<link[^>]+rel=["'][^"']*image_src[^"']*["'][^>]+href=["']([^"']+)["']/i.exec(html);
  if (link) add(link[1]);

  // Last-resort product-looking <img>. Prefer explicit product/image data attributes.
  const imgRe = /<img\b[^>]*>/ig;
  let m, count=0;
  while ((m = imgRe.exec(html)) && count < 120) {
    const tag = m[0];
    const hint = /product|gallery|pdp|main-image|primary-image|hero|media/i.test(tag);
    if (!hint) continue;
    const attrs = [
      /(?:data-src|data-original|data-lazy-src|src)=["']([^"']+)["']/i,
      /srcset=["']([^"']+)["']/i
    ];
    for (const ar of attrs) {
      const mm=ar.exec(tag);
      if (!mm) continue;
      const raw=mm[1].split(',')[0].trim().split(/\s+/)[0];
      add(raw);
      break;
    }
    count++;
  }
  return unique(candidates);
}

async function fetchWithTimeout(url, options={}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    return await fetch(url, {...options, signal: controller.signal});
  } finally { clearTimeout(timer); }
}

async function resolvePageToImage(pageUrl) {
  const u = new URL(pageUrl);
  if (!(await isPublicHost(u.hostname))) return null;
  const r = await fetchWithTimeout(u.toString(), {
    headers: {'user-agent':'Mozilla/5.0 (compatible; DEALCHECK/3.1; +https://dealcheck.app)', 'accept':'text/html,application/xhtml+xml'}
  });
  if (!r.ok) return null;
  const type = r.headers.get('content-type') || '';
  if (!type.includes('text/html')) return null;
  const html = (await r.text()).slice(0, 3_000_000);
  return extractImageCandidates(html, r.url || u.toString())[0] || null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({error:'Method not allowed'});
  const raw = String(req.query.url || '').trim();
  const mode = String(req.query.mode || 'resolve');
  let u;
  try { u = new URL(raw); } catch (_) { return res.status(400).json({error:'Invalid URL'}); }
  if (!/^https?:$/.test(u.protocol) || !(await isPublicHost(u.hostname))) {
    return res.status(400).json({error:'URL is not allowed'});
  }

  try {
    if (mode === 'proxy') {
      let imageUrl = u.toString();
      const looksLikeImage = /\.(?:png|jpe?g|webp|gif|avif)(?:$|[?#])/i.test(u.pathname);
      let r = await fetchWithTimeout(imageUrl, {
        headers: {'user-agent':'Mozilla/5.0 (compatible; DEALCHECK/3.1; +https://dealcheck.app)', 'accept':'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'},
        redirect:'follow'
      });
      let type = r.headers.get('content-type') || '';
      if (!r.ok || !type.startsWith('image/')) {
        const resolved = await resolvePageToImage(u.toString());
        if (!resolved) return res.status(404).end();
        imageUrl = resolved;
        const ru = new URL(imageUrl);
        if (!(await isPublicHost(ru.hostname))) return res.status(400).end();
        r = await fetchWithTimeout(imageUrl, {
          headers: {'user-agent':'Mozilla/5.0 (compatible; DEALCHECK/3.1; +https://dealcheck.app)', 'accept':'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'},
          redirect:'follow'
        });
        type = r.headers.get('content-type') || '';
      }
      if (!r.ok || !type.startsWith('image/')) return res.status(404).end();
      const len = Number(r.headers.get('content-length') || 0);
      if (len && len > 8_000_000) return res.status(413).end();
      res.setHeader('Content-Type', type.split(';')[0]);
      res.setHeader('Cache-Control','public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
      res.setHeader('X-Content-Type-Options','nosniff');
      const buffer = Buffer.from(await r.arrayBuffer());
      if (buffer.length > 8_000_000) return res.status(413).end();
      return res.status(200).send(buffer);
    }

    const imageUrl = await resolvePageToImage(u.toString());
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    return res.status(200).json({imageUrl});
  } catch (err) {
    console.warn('Product image resolution failed:', err?.message || err);
    if (mode === 'proxy') return res.status(404).end();
    return res.status(200).json({imageUrl:null});
  }
};
