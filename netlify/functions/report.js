// netlify/functions/report.js
// Receives bug reports from the game (web or desktop builds) and emails them
// to the developer via Resend. Same hardening pattern as subscribe.js:
// rate limit per IP, payload validation, size caps.
//
// Required environment variables (Netlify dashboard → Site settings → Env):
//   RESEND_API_KEY  — already set for the subscribe function
//   REPORT_EMAIL    — destination address for bug reports
//
// CORS is open ("*") because the game runs from itch.io's domain during the
// playtest and from Steam's overlay browser later; the endpoint is write-only,
// rate-limited and validates everything it accepts.

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5;                    // reports per IP per window
const MAX_MESSAGE_CHARS = 2000;
const MAX_SAVE_CHARS = 400_000;              // save stays < 256 KB by design

const hits = new Map(); // ip -> [timestamps] (per-instance; good enough here)

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Method not allowed" });
  }

  // ── Rate limit ──────────────────────────────────────────────────────
  const ip = event.headers["x-nf-client-connection-ip"] || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    return respond(429, { error: "Too many reports, try again later" });
  }
  recent.push(now);
  hits.set(ip, recent);

  // ── Validate payload ────────────────────────────────────────────────
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return respond(400, { error: "Invalid JSON" });
  }

  const message = String(payload.message || "").slice(0, MAX_MESSAGE_CHARS).trim();
  const save = String(payload.save || "");
  const build = String(payload.build || "unknown").slice(0, 64);
  const platform = String(payload.platform || "unknown").slice(0, 32);

  if (!message && !save) {
    return respond(400, { error: "Empty report" });
  }
  if (save.length > MAX_SAVE_CHARS) {
    return respond(413, { error: "Save data too large" });
  }

  // ── Send via Resend ─────────────────────────────────────────────────
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Echoes Bug Reports <reports@echoesofthegarden.com>",
        to: [process.env.REPORT_EMAIL],
        subject: `[EotG bug] ${build} / ${platform} — ${message.slice(0, 60) || "(no message)"}`,
        text:
          `Build: ${build}\nPlatform: ${platform}\nIP window hits: ${recent.length}\n\n` +
          `Message:\n${message || "(none)"}\n`,
        attachments: save
          ? [{
              filename: "garden_save.json",
              content: Buffer.from(save).toString("base64"),
            }]
          : [],
      }),
    });
    if (!res.ok) {
      console.error("Resend error", res.status, await res.text());
      return respond(502, { error: "Mail delivery failed" });
    }
  } catch (err) {
    console.error("Report error", err);
    return respond(502, { error: "Mail delivery failed" });
  }

  return respond(200, { ok: true });
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
