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
  try { return new URL(value, base).toString(); } catch (_) { return null; }
}
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  if (req.method !== 'GET') return res.status(405).json({error:'Method not allowed'});
  const raw = String(req.query.url || '').trim();
  let u;
  try { u = new URL(raw); } catch (_) { return res.status(400).json({error:'Invalid URL'}); }
  if (!/^https?:$/.test(u.protocol) || !(await isPublicHost(u.hostname))) return res.status(400).json({error:'URL is not allowed'});
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    const r = await fetch(u.toString(), {
      headers: {'user-agent':'Mozilla/5.0 (compatible; DEALCHECK/1.0; +https://dealcheck.app)'},
      redirect:'follow', signal: controller.signal
    });
    clearTimeout(timer);
    if (!r.ok) return res.status(404).json({imageUrl:null});
    const type = r.headers.get('content-type') || '';
    if (!type.includes('text/html')) return res.status(404).json({imageUrl:null});
    const html = (await r.text()).slice(0, 2_000_000);
    const patterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i
    ];
    let imageUrl = null;
    for (const p of patterns) { const m = html.match(p); if (m) { imageUrl = absolute(r.url || u.toString(), m[1]); break; } }
    if (!imageUrl) {
      const link = html.match(/<link[^>]+rel=["'][^"']*image_src[^"']*["'][^>]+href=["']([^"']+)["']/i);
      if (link) imageUrl = absolute(r.url || u.toString(), link[1]);
    }
    return res.status(200).json({imageUrl});
  } catch (err) {
    return res.status(200).json({imageUrl:null});
  }
};
