// Cloudflare Worker: only /api/* reaches this script (see run_worker_first in wrangler.jsonc).
// Every other request is a static asset. Secrets: RESEND_API_KEY, RESEND_AUDIENCE_ID, REPORT_EMAIL.
//
// Rate limits live in memory, so they are per isolate: enough to stop naive loops, not a real quota.
// ponytail: per-isolate limits; move to the Workers rate limiting binding if abuse appears.
import { Buffer } from 'node:buffer';

const RATE_WINDOW_MS = 10 * 60 * 1000;
const SUBSCRIBES_PER_WINDOW = 3;
const REPORTS_PER_WINDOW = 5;
const MAX_MESSAGE_CHARS = 2000;
const MAX_SAVE_CHARS = 400_000; // the save stays < 256 KB by design
const MAX_REPORT_BYTES = MAX_SAVE_CHARS * 2; // a JSON-in-JSON save grows when escaped

// The game posts from itch.io today and Steam's overlay later: the endpoint is write-only,
// rate-limited and validates everything it accepts.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const subscribeHits = new Map(); // ip -> [timestamps]
const reportHits = new Map();

/** Records a hit and returns how many this ip has made inside the window. */
function countHit(hits, ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) {
    for (const [key, stamps] of hits) {
      if (stamps.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length;
}

const json = (status, body, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

const clientIp = (request) => request.headers.get('cf-connecting-ip') || 'unknown';

const resend = (path, body, apiKey) =>
  fetch(`https://api.resend.com${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const isValidEmail = (email) => email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const WELCOME_HTML = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#090b08;font-family:Georgia,serif">
  <div style="max-width:520px;margin:0 auto;padding:48px 32px">
    <div style="text-align:center;margin-bottom:32px">
      <span style="font-size:48px">🌱</span>
    </div>
    <h1 style="font-family:Georgia,serif;color:#e8cb7a;font-size:22px;font-weight:normal;margin-bottom:16px;text-align:center">
      Welcome to the Garden
    </h1>
    <p style="color:#c8dcc8;font-size:16px;line-height:1.7;margin-bottom:16px">
      You're on the list. We'll let you know when the garden opens.
    </p>
    <p style="color:#c8dcc8;font-size:16px;line-height:1.7;margin-bottom:32px">
      When Early Access launches, you'll receive a <strong style="color:#8fba7a">Founder's Seed</strong> — 
      an exclusive item only available to newsletter subscribers.
    </p>
    <div style="border-top:1px solid #222820;padding-top:24px;text-align:center">
      <a href="https://echoes-of-the-garden.netlify.app/" style="color:#5a9e6a;font-size:14px;text-decoration:none">
        echoesofthegarden.com
      </a>
    </div>
    <p style="color:#3a5040;font-size:12px;text-align:center;margin-top:16px;line-height:1.5">
      You received this because you subscribed at echoesofthegarden.com.<br>
      No spam, ever. Unsubscribe at any time.
    </p>
  </div>
</body>
</html>`;

async function subscribe(request, env) {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  let email, website;
  try {
    ({ email, website } = JSON.parse((await request.text()) || '{}'));
  } catch {
    return json(400, { error: 'Invalid request body' });
  }

  // Honeypot: humans never fill it. Pretend it worked, so the bot learns nothing.
  if (typeof website === 'string' && website.trim() !== '') return json(200, { ok: true });

  if (countHit(subscribeHits, clientIp(request)) > SUBSCRIBES_PER_WINDOW) {
    return json(429, { error: 'Too many requests. Please try again later.' });
  }

  email = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!isValidEmail(email)) return json(400, { error: 'Invalid email address' });

  if (!env.RESEND_API_KEY || !env.RESEND_AUDIENCE_ID) {
    console.error('Missing RESEND_API_KEY or RESEND_AUDIENCE_ID');
    return json(500, { error: 'Server configuration error' });
  }

  try {
    const contact = await resend(`/audiences/${env.RESEND_AUDIENCE_ID}/contacts`, { email, unsubscribed: false }, env.RESEND_API_KEY);
    if (!contact.ok && contact.status !== 409) {
      console.error('Resend contacts error', contact.status, await contact.text());
      return json(500, { error: 'Internal server error' });
    }
    // Welcome only on the first subscription: 409 means the contact already exists.
    if (contact.ok) {
      const welcome = await resend('/emails', {
        from: 'Echoes of the Garden <hello@echoesofthegarden.com>',
        to: email,
        subject: '🌱 Welcome to Echoes of the Garden',
        html: WELCOME_HTML,
      }, env.RESEND_API_KEY);
      // The contact is saved, so the visitor is subscribed either way. Keep the failure visible in the logs.
      if (!welcome.ok) console.error('Resend welcome error', welcome.status, await welcome.text());
    }
    return json(200, { ok: true });
  } catch (err) {
    console.error('Subscribe error', err);
    return json(500, { error: 'Internal server error' });
  }
}

async function report(request, env) {
  const respond = (status, body) => json(status, body, CORS_HEADERS);

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (request.method !== 'POST') return respond(405, { error: 'Method not allowed' });

  const hits = countHit(reportHits, clientIp(request));
  if (hits > REPORTS_PER_WINDOW) return respond(429, { error: 'Too many reports, try again later' });

  // Refuse oversized bodies before parsing them: the free plan allows 10 ms of CPU.
  if (Number(request.headers.get('content-length')) > MAX_REPORT_BYTES) {
    return respond(413, { error: 'Save data too large' });
  }

  let payload;
  try {
    payload = JSON.parse((await request.text()) || '{}');
  } catch {
    return respond(400, { error: 'Invalid JSON' });
  }

  const message = String(payload.message || '').slice(0, MAX_MESSAGE_CHARS).trim();
  const save = String(payload.save || '');
  const build = String(payload.build || 'unknown').slice(0, 64);
  const platform = String(payload.platform || 'unknown').slice(0, 32);

  if (!message && !save) return respond(400, { error: 'Empty report' });
  if (save.length > MAX_SAVE_CHARS) return respond(413, { error: 'Save data too large' });

  if (!env.RESEND_API_KEY || !env.REPORT_EMAIL) {
    console.error('Missing RESEND_API_KEY or REPORT_EMAIL');
    return respond(500, { error: 'Server configuration error' });
  }

  try {
    const res = await resend('/emails', {
      from: 'Echoes Bug Reports <reports@echoesofthegarden.com>',
      to: [env.REPORT_EMAIL],
      subject: `[EotG bug] ${build} / ${platform} — ${message.slice(0, 60) || '(no message)'}`,
      text: `Build: ${build}\nPlatform: ${platform}\nIP window hits: ${hits}\n\nMessage:\n${message || '(none)'}\n`,
      attachments: save ? [{ filename: 'garden_save.json', content: Buffer.from(save).toString('base64') }] : [],
    }, env.RESEND_API_KEY);
    if (!res.ok) {
      console.error('Resend error', res.status, await res.text());
      return respond(502, { error: 'Mail delivery failed' });
    }
  } catch (err) {
    console.error('Report error', err);
    return respond(502, { error: 'Mail delivery failed' });
  }

  return respond(200, { ok: true });
}

export default {
  fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/subscribe') return subscribe(request, env);
    if (pathname === '/api/report') return report(request, env);
    return json(404, { error: 'Not found' });
  },
};
