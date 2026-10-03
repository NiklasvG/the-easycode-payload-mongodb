// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(), enable: vi.fn(), disable: vi.fn(), redirect: vi.fn(),
}))
vi.mock('next/server', async (importOriginal) => ({ ...await importOriginal<typeof import('next/server')>(), connection: async () => {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ auth: mocks.auth, logger: { error: vi.fn() } }) }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/headers', () => ({ draftMode: async () => ({ enable: mocks.enable, disable: mocks.disable }) }))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))
import { GET } from '@/app/(frontend)/next/preview/route'

describe('preview authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('PREVIEW_SECRET', 'test-secret')
    mocks.auth.mockResolvedValue({ user: null })
  })
  const request = (path = '/draft', secret = 'test-secret') => new NextRequest(
    `http://localhost/next/preview?collection=pages&slug=draft&path=${encodeURIComponent(path)}&previewSecret=${secret}`,
  )
  it('rejects anonymous Payload auth results', async () => {
    expect((await GET(request())).status).toBe(403)
    expect(mocks.enable).not.toHaveBeenCalled()
  })
  it('rejects a missing configured secret', async () => {
    vi.stubEnv('PREVIEW_SECRET', '')
    expect((await GET(request('/draft', ''))).status).toBe(403)
  })
  it.each(['//example.test', '/\\example.test'])('rejects external redirect path %s', async (path) => {
    expect((await GET(request(path))).status).toBe(500)
    expect(mocks.enable).not.toHaveBeenCalled()
  })
  it('enables drafts for an authenticated editor', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'editor' } })
    await GET(request())
    expect(mocks.enable).toHaveBeenCalledOnce()
    expect(mocks.redirect).toHaveBeenCalledWith('/draft')
  })
})
