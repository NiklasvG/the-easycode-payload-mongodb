// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ find: vi.fn(), keys: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => mocks }))
vi.mock('next/cache', () => ({ unstable_cache: (fn: () => Promise<unknown>, keys: string[]) => { mocks.keys(keys); return fn } }))
import { getCachedSitemap, sitemapResponse } from '@/utilities/sitemaps'
import robots from '@/app/robots'

describe('native sitemaps', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://example.test'); vi.stubEnv('APP_ENV', 'production') })
  it('paginates published pages and keeps nested canonical URLs', async () => {
    mocks.find.mockResolvedValueOnce({ docs: [{ slug: 'home', updatedAt: '2026-10-03' }], totalPages: 2 }).mockResolvedValueOnce({ docs: [{ slug: 'child', breadcrumbs: [{ url: '/parent/child' }], updatedAt: '2026-10-03' }], totalPages: 2 })
    const result = await getCachedSitemap('pages')
    expect(result.map(item => item.url)).toEqual(['https://example.test/suche', 'https://example.test/', 'https://example.test/parent/child'])
    expect(mocks.find).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, overrideAccess: false, draft: false, where: { _status: { equals: 'published' } } }))
  })
  it('includes valid client/project URLs and varies cache keys by origin', async () => {
    mocks.find.mockResolvedValue({ docs: [{ slug: 'example', client: { slug: 'client' }, updatedAt: '2026-10-03' }, { slug: 'orphan', client: null }], totalPages: 1 })
    expect((await getCachedSitemap('projects')).map(item => item.url)).toEqual(['https://example.test/projekte/client/example'])
    expect(mocks.keys).toHaveBeenCalledWith(['sitemap', 'projects', 'https://example.test'])
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://staging.example.test/')
    await getCachedSitemap('projects')
    expect(mocks.keys).toHaveBeenLastCalledWith(['sitemap', 'projects', 'https://staging.example.test'])
  })
  it('escapes legacy XML responses', async () => {
    const response = sitemapResponse([{ url: 'https://example.test/?a=1&b=2' }])
    expect(response.headers.get('Content-Type')).toContain('application/xml')
    expect(await response.text()).toContain('?a=1&amp;b=2')
  })
  it('blocks all crawling on staging and protects admin/API on production', () => {
    expect(robots().rules).toEqual({ userAgent: '*', disallow: ['/admin/', '/api/', '/next/'] })
    vi.stubEnv('APP_ENV', 'staging')
    expect(robots().rules).toEqual({ userAgent: '*', disallow: '/' })
  })
})
