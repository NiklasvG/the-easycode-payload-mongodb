'use strict';
const http = require('node:http');
const crypto = require('node:crypto');
const { Buffer } = require('node:buffer');
const user = process.env.GATE_USER;
const password = process.env.GATE_PASSWORD;
const secret = process.env.GATE_COOKIE_SECRET;
if (!user || !password || !secret || secret.length < 32) throw new Error('Gateway credentials missing');
const cookieName = '__Host-umami_gate';
const sessions = new Map();
const equal = (a, b) => {
  const x = crypto.createHash('sha256').update(a).digest();
  const y = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(x, y);
};
const sign = value => crypto.createHmac('sha256', secret).update(value).digest('base64url');
function authenticated(req) {
  const authorization = req.headers.authorization || '';
  if (authorization.startsWith('Basic ') && equal(authorization.slice(6), Buffer.from(`${user}:${password}`).toString('base64'))) return true;
  const token = (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
  if (!token) return false;
  const [expires, mac, extra] = token.split('.');
  return !extra && /^\d+$/.test(expires) && Number(expires) > Date.now() && equal(mac || '', sign(expires));
}
function allowedRate(req, group, capacity, refill) {
  // Only the project's reverse proxy reaches this listener; Traefik supplies the peer address.
  const address = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',').pop().trim();
  const key = group + ':' + address;
  const now = Date.now();
  let entry = sessions.get(key) || { tokens: capacity, at: now };
  entry.tokens = Math.min(capacity, entry.tokens + (now - entry.at) * refill / 1000);
  entry.at = now;
  sessions.set(key, entry);
  if (entry.tokens < 1) return false;
  entry.tokens--;
  return true;
}
setInterval(() => {
  const cutoff = Date.now() - 600000;
  for (const [key, value] of sessions) if (value.at < cutoff) sessions.delete(key);
}, 60000).unref();
const server = http.createServer((req, res) => {
  if (req.url === '/_gateway/health' && ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress)) {
    res.writeHead(200); return res.end('ok');
  }
  let path;
  try { new URL(req.url, 'http://gateway'); path = req.url.split('?')[0]; } catch { res.writeHead(400); return res.end(); }
  const publicTracking = (path === '/script.js' && ['GET', 'HEAD'].includes(req.method)) ||
    (path === '/api/send' && ['POST', 'OPTIONS'].includes(req.method));
  if (!allowedRate(req, publicTracking ? 'tracking' : 'management', publicTracking ? 120 : 30, publicTracking ? 20 : 2)) {
    res.writeHead(429, { 'Retry-After': '1', 'Cache-Control': 'no-store' }); return res.end();
  }
  if (!publicTracking && !authenticated(req)) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Umami management", charset="UTF-8"', 'Cache-Control': 'no-store' }); return res.end('Authentication required');
  }
  if (!publicTracking) {
    const expiry = String(Date.now() + 8 * 60 * 60 * 1000);
    res.setHeader('Set-Cookie', `${cookieName}=${expiry}.${sign(expiry)}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=28800`);
    res.setHeader('Cache-Control', 'no-store');
  }
  const headers = { ...req.headers };
  // Basic belongs to this gateway. Bearer belongs to Umami and passes unchanged.
  if ((headers.authorization || '').startsWith('Basic ')) delete headers.authorization;
  delete headers['proxy-authorization'];
  headers.cookie = (headers.cookie || '').split(';').filter(x => !x.trim().startsWith(cookieName + '=')).join(';');
  for (const name of ['connection', 'keep-alive', 'proxy-authenticate', 'te', 'trailer', 'transfer-encoding', 'upgrade']) delete headers[name];
  const upstream = http.request({ hostname: process.env.UPSTREAM_HOST || 'umami', port: process.env.UPSTREAM_PORT || 3000, path: req.url, method: req.method, headers }, response => {
    for (const [name, value] of Object.entries(response.headers)) {
      if (['connection', 'transfer-encoding'].includes(name)) continue;
      if (name === 'set-cookie' && res.hasHeader('Set-Cookie')) res.setHeader(name, [res.getHeader(name), ...[].concat(value)]);
      else if (name !== 'cache-control' || publicTracking) res.setHeader(name, value);
    }
    res.statusCode = response.statusCode;
    response.pipe(res);
  });
  upstream.setTimeout(30000, () => upstream.destroy());
  upstream.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
  req.on('aborted', () => upstream.destroy());
  req.pipe(upstream);
});
server.requestTimeout = 30000;
server.headersTimeout = 10000;
server.listen(process.env.PORT || 3000, '0.0.0.0');
