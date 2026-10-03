// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest'
import { createRequestLimiter, hasAllowedOrigin, readLimitedJSON } from '@/utilities/publicRequestLimits'
afterEach(() => vi.unstubAllEnvs())
it('cannot bypass the aggregate budget with spoofed forwarding headers', () => {
  vi.stubEnv('PUBLIC_TRUSTED_CLIENT_IP_HEADER', '')
  const limit = createRequestLimiter(2, 1)
  expect(limit(new Headers({ 'x-forwarded-for': '1.2.3.4' }), 1000)).toBe(true)
  expect(limit(new Headers({ 'x-forwarded-for': '5.6.7.8' }), 1000)).toBe(true)
  expect(limit(new Headers({ 'x-forwarded-for': '9.8.7.6' }), 1000)).toBe(false)
  expect(limit(new Headers(), 62000)).toBe(true)
})
it('applies per-client limits only to an explicitly trusted proxy header', () => {
  vi.stubEnv('PUBLIC_TRUSTED_CLIENT_IP_HEADER', 'x-real-ip')
  const limit = createRequestLimiter(10, 1)
  expect(limit(new Headers({ 'x-real-ip': '1.2.3.4' }), 1000)).toBe(true)
  expect(limit(new Headers({ 'x-real-ip': '1.2.3.4' }), 1000)).toBe(false)
  expect(limit(new Headers({ 'x-real-ip': '5.6.7.8' }), 1000)).toBe(true)
})
it('rejects oversized chunked bodies even without Content-Length', async () => {
  const request = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ text: 'x'.repeat(100) }) })
  await expect(readLimitedJSON(request, 50)).rejects.toMatchObject({ status: 413 })
})
it('rejects cross-origin browser requests', () => {
  vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://example.test')
  expect(hasAllowedOrigin({ headers: new Headers({ origin: 'https://attacker.test' }) })).toBe(false)
  expect(hasAllowedOrigin({ headers: new Headers({ origin: 'https://example.test' }) })).toBe(true)
})
