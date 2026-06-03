// netlify/functions/subscribe.js
// Newsletter subscription handler — Resend API
//
// Required environment variables (set in Netlify dashboard):
//   RESEND_API_KEY      — from resend.com dashboard
//   RESEND_AUDIENCE_ID  — audience ID from resend.com

const https = require('https');

/**
 * Minimal Resend API wrapper — no SDK dependency needed.
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
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

exports.handler = async (event) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Parse body
  let email;
  try {
    ({ email } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  // Validate email
  if (!isValidEmail(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email address' }) };
  }

  const apiKey     = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    console.error('Missing RESEND_API_KEY or RESEND_AUDIENCE_ID');
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  try {
    // Add contact to Resend audience
    const contactRes = await resendRequest(
      `/audiences/${audienceId}/contacts`,
      'POST',
      { email: email.trim(), unsubscribed: false },
      apiKey
    );

    // 200 = created, 409 = already exists (treat as success)
    if (contactRes.status !== 200 && contactRes.status !== 201 && contactRes.status !== 409) {
      console.error('Resend contacts error:', contactRes);
      throw new Error(`Resend API error: ${contactRes.status}`);
    }

    // Send welcome email
    await resendRequest(
      '/emails',
      'POST',
      {
        from: 'Echoes of the Garden <hello@echoesofthegarden.com>',
        to:   email.trim(),
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

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };

  } catch (err) {
    console.error('Subscribe function error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
