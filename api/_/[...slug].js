// api/_/[...slug].js
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
    maxDuration: 300,
  },
};

const getNoise = () => ({
  'x-request-id': Math.random().toString(36).substring(2, 15),
  'x-correlation-id': Date.now().toString(36),
  'x-cache-status': Math.random() > 0.5 ? 'HIT' : 'MISS',
});

export default async function handler(req, res) {
  // Camouflage: درخواست‌های استاتیک را سریع جواب بده
  if (req.url.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff2?|ttf|eot)$/i)) {
    return res.status(204).end();
  }

  const targetUrl = process.env.TARGET_URL;
  if (!targetUrl) {
    return res.status(204).end();
  }

  try {
    const headers = {
      ...req.headers,
      ...getNoise(),
    };

    // حذف هدرهای حساس
    delete headers.host;
    delete headers['x-forwarded-for'];
    delete headers['x-real-ip'];
    delete headers['x-vercel-ip'];

    // مهم برای XHTTP + VLESS
    if (req.headers.upgrade === 'websocket' || req.headers['sec-websocket-key']) {
      // WebSocket relay (برای XHTTP معمولاً از ws استفاده می‌شود)
      return handleWebSocket(req, res, targetUrl);
    }

    const response = await fetch(targetUrl + req.url, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? null : req.body,
      redirect: 'manual',
    });

    res.status(response.status);

    for (const [key, value] of response.headers.entries()) {
      const lowerKey = key.toLowerCase();
      if (!['server', 'x-powered-by', 'via', 'x-vercel'].includes(lowerKey)) {
        res.setHeader(key, value);
      }
    }

    const data = await response.text();
    res.send(data);
  } catch (error) {
    res.status(204).end(); // Silent fail - بسیار مهم
  }
}

// WebSocket handler ساده (برای XHTTP بهتر کار می‌کند)
async function handleWebSocket(req, res, targetUrl) {
  res.status(204).end(); // فعلاً silent - نسخه کامل ws بعداً
}
