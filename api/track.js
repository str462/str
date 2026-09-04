module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method not allowed' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const name = String(body.name || '').slice(0, 80);
    if (!name) return res.status(400).json({ ok:false, error:'Missing event name' });
    // Vercel serverless logs are intentionally used here rather than a database.
    // This gives a lightweight conversion trail without introducing a new data store.
    console.log('[DEALCHECK_EVENT]', JSON.stringify({
      name,
      at: body.at || new Date().toISOString(),
      path: String(body.path || '').slice(0, 200),
      attribution: body.attribution || {},
      data: body.data || {}
    }));
    return res.status(204).end();
  } catch (e) {
    return res.status(400).json({ ok:false, error:'Invalid event payload' });
  }
};
