// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PayloadRequest } from 'payload'
import { runJobs } from '@/access/runJobs'
const request = (authorization?: string) => ({ req: { headers: new Headers(authorization ? { authorization } : {}) } as PayloadRequest })
describe('scheduler authorization', () => {
  afterEach(() => vi.unstubAllEnvs())
  it('rejects literal undefined and empty configured secrets', () => {
    vi.stubEnv('CRON_SECRET', undefined)
    expect(runJobs(request('Bearer undefined'))).toBe(false)
    vi.stubEnv('CRON_SECRET', '')
    expect(runJobs(request('Bearer '))).toBe(false)
  })
  it('accepts only the complete configured secret or a logged-in editor', () => {
    vi.stubEnv('CRON_SECRET', 'test-scheduler-secret')
    expect(runJobs(request())).toBe(false)
    expect(runJobs(request('Bearer wrong'))).toBe(false)
    expect(runJobs(request('Bearer test-scheduler-secret'))).toBe(true)
    expect(runJobs({ req: { user: { id: 'editor' } } as PayloadRequest })).toBe(true)
  })
})
