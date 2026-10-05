// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ find: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => mocks }))
vi.mock('next/cache', () => ({ unstable_cache: (fn: () => Promise<unknown>) => fn }))
import { getCachedLLMsIndex } from '@/utilities/llms'
import { GET } from '@/app/llms.txt/route'

describe('public AI content directory', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://example.test'); vi.stubEnv('APP_ENV', 'production') })
  it('paginates published content, escapes markdown and omits excluded documents and client internals', async () => {
    mocks.find.mockImplementation(async ({ collection, page }) => ({
      docs: collection === 'pages' ? (page === 1 ? [{ title: 'A [page]', slug: 'page', breadcrumbs: [{ url: '/parent/page' }] }, { title: 'Hidden', slug: 'hidden', meta: { noIndex: true } }] : [{ title: 'Second', slug: 'second' }])
        : collection === 'projects' ? [{ title: 'Project', slug: 'project', client: { slug: 'client', contacts: [{ email: 'private@example.test' }] }, shortDescription: 'Public summary' }, { title: 'Orphan', slug: 'orphan' }] : [],
      totalPages: collection === 'pages' ? 2 : 1,
    }))
    const body = await getCachedLLMsIndex()
    expect(body).toContain('A \\[page\\]')
    expect(body).toContain('https://example.test/parent/page')
    expect(body).toContain('https://example.test/second')
    expect(body).toContain('https://example.test/projekte/client/project')
    expect(body).not.toMatch(/Hidden|Orphan|private@example/)
    for (const [args] of mocks.find.mock.calls) {
      expect(args).toMatchObject({ overrideAccess: false, draft: false, where: { _status: { equals: 'published' } } })
    }
  })
  it('does not expose a staging directory', async () => {
    vi.stubEnv('APP_ENV', 'staging')
    const response = await GET()
    expect(response.status).toBe(404)
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex')
    expect(mocks.find).not.toHaveBeenCalled()
  })
})
