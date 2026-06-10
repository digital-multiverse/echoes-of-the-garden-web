// netlify/functions/subscribe.js
// Newsletter subscription handler — Resend API
//
// Required environment variables (set in Netlify dashboard):
//   RESEND_API_KEY      — from resend.com dashboard
//   RESEND_AUDIENCE_ID  — audience ID from resend.com
//
// Abuse protections:
//   1. Honeypot — the form includes a hidden "website" field. Humans never
//      fill it; bots auto-fill every input. Non-empty → silently accept
//      (return ok) without doing anything, so the bot learns nothing.
//   2. Rate limiting — max SUBSCRIBES_PER_WINDOW requests per IP per window.
//      In-memory, so it only persists while the Lambda container is warm.
//      Good enough to stop naive loops; not a substitute for double opt-in.
//   3. No duplicate welcome emails — if Resend reports the contact already
//      exists (409), we skip the welcome send.

const https = require('https');

// ── Rate limiting (per warm container) ─────────────────────────────────
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const SUBSCRIBES_PER_WINDOW = 3;
const ipHits = new Map(); // ip -> array of timestamps

function isRateLimited(ip) {
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  hits.push(now);
  ipHits.set(ip, hits);
  // Opportunistic cleanup so the map doesn't grow unbounded
  if (ipHits.size > 500) {
    for (const [key, stamps] of ipHits) {
      if (stamps.every(t => now - t >= RATE_WINDOW_MS)) ipHits.delete(key);
    }
  }
  return hits.length > SUBSCRIBES_PER_WINDOW;
}

// ── Resend API wrapper — no SDK dependency needed ──────────────────────
/**
 * @param {string} path
 * @param {string} method
 * @param {object} body
 * @param {string} apiKey
 */
function resendRequest(path, method, body, apiKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'api.resend.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/** Basic email format validation */
function isValidEmail(email) {
  return typeof email === 'string'
    && email.length <= 254
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

exports.handler = async (event) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Parse body
  let email, website;
  try {
    ({ email, website } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  // Honeypot tripped — pretend everything went fine and do nothing.
  if (typeof website === 'string' && website.trim() !== '') {
    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true }) };
  }

  // Rate limit by client IP (Netlify provides the real client IP here)
  const ip = event.headers['x-nf-client-connection-ip']
    || (event.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || 'unknown';
  if (isRateLimited(ip)) {
    return { statusCode: 429, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Too many requests. Please try again later.' }) };
  }

  // Normalize + validate email
  email = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!isValidEmail(email)) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Invalid email address' }) };
  }

  const apiKey     = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    console.error('Missing RESEND_API_KEY or RESEND_AUDIENCE_ID');
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  try {
    // Add contact to Resend audience
    const contactRes = await resendRequest(
      `/audiences/${audienceId}/contacts`,
      'POST',
      { email, unsubscribed: false },
      apiKey
    );

    const alreadySubscribed = contactRes.status === 409;
    const created = contactRes.status === 200 || contactRes.status === 201;

    if (!created && !alreadySubscribed) {
      console.error('Resend contacts error:', contactRes);
      throw new Error(`Resend API error: ${contactRes.status}`);
    }

    // Send welcome email — only on first subscription, never on re-submits
    if (created) {
      await resendRequest(
        '/emails',
        'POST',
        {
          from: 'Echoes of the Garden <hello@echoesofthegarden.com>',
          to:   email,
          subject: '🌱 Welcome to Echoes of the Garden',
          html: `
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
      <a href="https://echoesofthegarden.com" style="color:#5a9e6a;font-size:14px;text-decoration:none">
        echoesofthegarden.com
      </a>
    </div>
    <p style="color:#3a5040;font-size:12px;text-align:center;margin-top:16px;line-height:1.5">
      You received this because you subscribed at echoesofthegarden.com.<br>
      No spam, ever. Unsubscribe at any time.
    </p>
  </div>
</body>
</html>`,
        },
        apiKey
      );
    }

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({ ok: true }),
    };

  } catch (err) {
    console.error('Subscribe function error:', err);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
