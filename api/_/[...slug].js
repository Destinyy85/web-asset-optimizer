// api/_/[...slug].js
export const config = { api: { bodyParser: false, externalResolver: true } };

const NOISE = () => ({
  'x-request-id': Math.random().toString(36).slice(2),
  'x-session': Date.now().toString(36),
  'x-cache': 'MISS'
});

async function handleRequest(req, res) {
  // مسیرهای فیک برای camouflage
  if (req.url.match(/\.(ico|png|jpg|css|js)$/)) {
    return res.status(204).end();
  }

  const target = process.env.TARGET_URL || 'https://your-real-target.com';

  try {
    const headers = { ...req.headers, ...NOISE() };
    delete headers.host;
    delete headers['x-forwarded-for']; // تمیز کردن

    const response = await fetch(target + req.url, {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? null : req.body,
    });

    res.status(response.status);
    for (const [k, v] of response.headers.entries()) {
      if (!['server', 'x-powered-by'].includes(k.toLowerCase())) {
        res.setHeader(k, v);
      }
    }

    const data = await response.text();
    res.send(data);
  } catch (err) {
    res.status(204).end(); // silent fail برای مخفی ماندن
  }
}

export default handleRequest;
