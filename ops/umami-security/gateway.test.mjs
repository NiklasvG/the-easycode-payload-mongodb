import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
test('Gateway preserves tracking, challenges management, and retains Umami Bearer authentication', async () => {
  const requests = [];
  const upstream = http.createServer((req, res) => {
    requests.push({ path: req.url, authorization: req.headers.authorization, cookie: req.headers.cookie });
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Set-Cookie', 'app=retained; Path=/; Secure');
    if (req.url === '/api/auth/verify' && req.headers.authorization !== 'Bearer valid') res.writeHead(401);
    else res.writeHead(200);
    req.pipe(res);
  });
  await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve));
  const reservation = http.createServer();
  await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const child = spawn(process.execPath, [path.join(__dirname, 'gateway.mjs')], { env: { ...process.env, PORT: String(port), UPSTREAM_HOST: '127.0.0.1', UPSTREAM_PORT: String(upstream.address().port), GATE_USER: 'operator', GATE_PASSWORD: 'fixture-password', GATE_COOKIE_SECRET: 'fixture-secret-with-at-least-32-characters' }, stdio: 'pipe' });
  let errors = ''; child.stderr.on('data', x => errors += x);
  const call = (url, init = {}) => fetch(`http://127.0.0.1:${port}${url}`, init);
  try {
    for (let i = 0; i < 100; i++) {
      try { if ((await call('/_gateway/health')).status === 200) break; } catch {}
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    assert.equal(errors, '');
    for (const endpoint of ['/', '/login', '/api/auth/login', '/api/auth/verify', '/api/send/extra', '/script.js/extra']) assert.equal((await call(endpoint)).status, 401, endpoint);
    assert.equal((await call('/script.js')).status, 200);
    assert.equal((await call('/script.js', { method: 'POST' })).status, 401);
    assert.equal((await call('/api/send')).status, 401);
    assert.equal((await call('/api/send', { method: 'POST', body: 'tracking-fixture' })).status, 200);
    const preflight = await call('/api/send', { method: 'OPTIONS', headers: { Origin: 'https://the-easycode.eu', 'Access-Control-Request-Method': 'POST' } });
    assert.equal(preflight.status, 200); assert.equal(preflight.headers.get('access-control-allow-origin'), '*');
    assert.equal((await call('/', { headers: { Authorization: 'Basic invalid' } })).status, 401);
    const login = await call('/login', { headers: { Authorization: 'Basic ' + Buffer.from('operator:fixture-password').toString('base64') } });
    assert.equal(login.status, 200); assert.equal(requests.at(-1).authorization, undefined);
    const cookies = login.headers.getSetCookie();
    assert.equal(cookies.length, 2); assert.match(cookies[0], /Secure; HttpOnly; SameSite=Strict/);
    const cookie = cookies[0].split(';')[0];
    assert.equal((await call('/api/auth/verify', { headers: { Cookie: cookie, Authorization: 'Bearer valid' } })).status, 200);
    assert.equal(requests.at(-1).authorization, 'Bearer valid'); assert.equal(requests.at(-1).cookie.includes('__Host-umami_gate'), false);
    assert.equal((await call('/api/auth/verify', { headers: { Cookie: cookie, Authorization: 'Bearer invalid' } })).status, 401);
    assert.equal((await call('/api/auth/verify', { headers: { Authorization: 'Bearer valid' } })).status, 401);
    assert.equal((await call('/', { headers: { Cookie: cookie + 'tampered' } })).status, 401);
    for (let i = 0; i < 60; i++) assert.equal((await call('/_next/static/dashboard-fixture.js', { headers: { Cookie: cookie } })).status, 200, 'Authenticated dashboard asset burst');
    let limited = false;
    for (let i = 0; i < 140; i++) if ((await call('/api/send', { method: 'OPTIONS' })).status === 429) { limited = true; break; }
    assert.equal(limited, true);
  } finally {
    child.kill(); await new Promise(resolve => child.once('exit', resolve));
    upstream.closeAllConnections(); await new Promise(resolve => upstream.close(resolve));
  }
});
