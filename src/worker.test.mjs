// Run: node --test src/
import assert from 'node:assert/strict';
import { test } from 'node:test';
import worker from './worker.js';

const env = { RESEND_API_KEY: 'k', RESEND_AUDIENCE_ID: 'a', REPORT_EMAIL: 'dev@example.com' };
let ipCount = 0;

function post(path, body, { ip = `10.0.0.${++ipCount}`, method = 'POST' } = {}) {
  return new Request(`https://x.test${path}`, {
    method,
    headers: { 'cf-connecting-ip': ip },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  });
}

/** Replaces fetch with a Resend stub and returns the calls it received. */
function stubResend(status = 200) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, method: init.method, body: JSON.parse(init.body) });
    return new Response('{}', { status: typeof status === 'function' ? status(url) : status });
  };
  return calls;
}

test('a new subscriber gets a contact and a welcome email', async () => {
  const calls = stubResend();
  const res = await worker.fetch(post('/api/subscribe', { email: ' Ana@Example.com ' }), env);
  assert.equal(res.status, 200);
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /audiences\/a\/contacts$/);
  assert.equal(calls[0].body.email, 'ana@example.com');
  assert.match(calls[1].body.html, /You are on the list/);
  assert.doesNotMatch(calls[1].body.html, /Founder/);
  assert.match(calls[1].body.html, /mailto:hello@echoesofthegarden\.com\?subject=unsubscribe/);
  assert.match(calls[1].body.headers['List-Unsubscribe'], /^<mailto:/);
});

test('an existing subscriber gets no second welcome', async () => {
  const calls = stubResend(409);
  const res = await worker.fetch(post('/api/subscribe', { email: 'a@b.co' }), env);
  assert.equal(res.status, 200);
  assert.equal(calls.length, 1);
});

test('a failed welcome keeps the subscription', async () => {
  stubResend((url) => (url.endsWith('/emails') ? 403 : 200));
  const res = await worker.fetch(post('/api/subscribe', { email: 'a@b.co' }), env);
  assert.equal(res.status, 200);
});

test('the honeypot sends nothing', async () => {
  const calls = stubResend();
  const res = await worker.fetch(post('/api/subscribe', { email: 'a@b.co', website: 'x' }), env);
  assert.equal(res.status, 200);
  assert.equal(calls.length, 0);
});

test('subscribe rejects bad input, bad methods and missing secrets', async () => {
  stubResend();
  assert.equal((await worker.fetch(post('/api/subscribe', { email: 'nope' }), env)).status, 400);
  assert.equal((await worker.fetch(post('/api/subscribe', null, { method: 'GET' }), env)).status, 405);
  assert.equal((await worker.fetch(post('/api/subscribe', { email: 'a@b.co' }), {})).status, 500);
});

test('subscribe limits each ip to 3 per window', async () => {
  stubResend();
  const send = () => worker.fetch(post('/api/subscribe', { email: 'a@b.co' }, { ip: 'sub-limit' }), env);
  for (let i = 0; i < 3; i++) assert.equal((await send()).status, 200);
  assert.equal((await send()).status, 429);
});

test('a report arrives with the save attached in base64 and CORS open', async () => {
  const calls = stubResend();
  const save = '{"garden":"ñ"}';
  const res = await worker.fetch(post('/api/report', { message: 'hi', save, build: 'v0.12.0', platform: 'Web' }), env);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
  assert.deepEqual(calls[0].body.to, ['dev@example.com']);
  assert.match(calls[0].body.subject, /v0\.12\.0 \/ Web/);
  assert.equal(Buffer.from(calls[0].body.attachments[0].content, 'base64').toString(), save);
});

test('report handles preflight, bad input, size, delivery failure and the limit', async () => {
  stubResend();
  assert.equal((await worker.fetch(post('/api/report', null, { method: 'OPTIONS' }), env)).status, 204);
  assert.equal((await worker.fetch(post('/api/report', {}), env)).status, 400);
  assert.equal((await worker.fetch(post('/api/report', { save: 'x'.repeat(400_001) }), env)).status, 413);
  assert.equal((await worker.fetch(post('/api/report', { message: 'x' }), { RESEND_API_KEY: 'k' })).status, 500);
  stubResend(403);
  assert.equal((await worker.fetch(post('/api/report', { message: 'x' }), env)).status, 502);
  stubResend();
  const send = () => worker.fetch(post('/api/report', { message: 'x' }, { ip: 'rep-limit' }), env);
  for (let i = 0; i < 5; i++) assert.equal((await send()).status, 200);
  assert.equal((await send()).status, 429);
});

const signed = { ...env, UNSUBSCRIBE_SECRET: 's3cret' };

async function welcomeLink() {
  const calls = stubResend();
  await worker.fetch(post('/api/subscribe', { email: 'ana@example.com' }), signed);
  return calls[1];
}

test('with a secret, the welcome carries a signed one-click unsubscribe link', async () => {
  const mail = await welcomeLink();
  assert.match(mail.body.html, /https:\/\/echoesofthegarden\.com\/api\/unsubscribe\?e=ana%40example\.com&t=[\w-]+/);
  assert.match(mail.body.headers['List-Unsubscribe'], /^<https:.*>, <mailto:/);
  assert.equal(mail.body.headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
});

test('opening the link asks first, and only POST unsubscribes', async () => {
  const link = (await welcomeLink()).body.html.match(/https:\/\/echoesofthegarden\.com(\/api\/unsubscribe\?[^"]+)/)[1];
  let calls = stubResend();
  const get = await worker.fetch(new Request(`https://x.test${link}`), signed);
  assert.equal(get.status, 200);
  assert.match(await get.text(), /<form method="post"/);
  assert.equal(calls.length, 0);

  calls = stubResend();
  const res = await worker.fetch(new Request(`https://x.test${link}`, { method: 'POST', body: 'List-Unsubscribe=One-Click' }), signed);
  assert.equal(res.status, 200);
  assert.match(calls[0].url, /audiences\/a\/contacts\/ana%40example\.com$/);
  assert.equal(calls[0].method, 'PATCH');
  assert.deepEqual(calls[0].body, { unsubscribed: true });
});

test('a forged or edited unsubscribe link does nothing', async () => {
  const calls = stubResend();
  const forged = new Request('https://x.test/api/unsubscribe?e=ana%40example.com&t=nope', { method: 'POST' });
  assert.equal((await worker.fetch(forged, signed)).status, 400);
  assert.equal(calls.length, 0);
});

test('unknown api paths are a 404', async () => {
  assert.equal((await worker.fetch(post('/api/nope', {}), env)).status, 404);
});
