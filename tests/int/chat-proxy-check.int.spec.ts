// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/ai-chat/proxy-check/route'

const token = 'a'.repeat(64)
const request = (key = token, ip = '198.51.100.10') =>
  new Request('https://example.test/api/ai-chat/proxy-check', {
    headers: { 'x-proxy-diagnostic-token': key, 'x-real-ip': ip },
  })
beforeEach(() => {
  vi.stubEnv('APP_ENV', 'staging')
  vi.stubEnv('CHAT_PROXY_DIAGNOSTIC_TOKEN', token)
  vi.stubEnv('CHAT_PROXY_DIAGNOSTIC_UNTIL', new Date(Date.now() + 1800000).toISOString())
  vi.stubEnv('PUBLIC_TRUSTED_CLIENT_IP_HEADER', 'x-real-ip')
})
afterEach(() => vi.unstubAllEnvs())

it('requires staging, authentication and an expiry within one hour', () => {
  expect(GET(request('wrong')).status).toBe(404)
  vi.stubEnv('APP_ENV', 'production')
  expect(GET(request()).status).toBe(404)
  vi.stubEnv('APP_ENV', 'staging')
  for (const expiry of [
    '',
    'invalid',
    new Date(Date.now() - 1).toISOString(),
    new Date(Date.now() + 7200000).toISOString(),
  ]) {
    vi.stubEnv('CHAT_PROXY_DIAGNOSTIC_UNTIL', expiry)
    expect(GET(request()).status).toBe(404)
  }
})
it('reports only validity and test marker acceptance, never raw IPs or secrets', async () => {
  const response = GET(request())
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(await response.json()).toEqual({
    header: 'x-real-ip',
    validClientIp: true,
    testAddressAccepted: false,
  })
  expect(await GET(request(token, '192.0.2.123')).json()).toEqual({
    header: 'x-real-ip',
    validClientIp: true,
    testAddressAccepted: true,
  })
  expect((await GET(request(token, 'invalid')).json()).validClientIp).toBe(false)
})
