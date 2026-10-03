import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findGlobal: vi.fn(async ({ depth }: { depth: number }) => ({ link: depth ? { id: 'page', title: 'Published' } : 'page' })),
  find: vi.fn(async () => ({ docs: [{ slug: 'example' }] })),
  entries: new Map<string, unknown>(),
}))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => mocks }))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => Promise<unknown>, keys: string[]) => async () => {
    const key = JSON.stringify(keys)
    if (!mocks.entries.has(key)) mocks.entries.set(key, await fn())
    return mocks.entries.get(key)
  },
}))
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getCachedDocument } from '@/utilities/getDocument'
import { getCachedRedirects } from '@/utilities/getRedirects'

describe('public CMS cache isolation', () => {
  beforeEach(() => { mocks.entries.clear(); vi.clearAllMocks() })
  it('keeps relationship depths separate and reuses each result', async () => {
    expect(await getCachedGlobal('header', 0)()).toEqual({ link: 'page' })
    expect(await getCachedGlobal('header', 2)()).toEqual({ link: { id: 'page', title: 'Published' } })
    await getCachedGlobal('header', 0)()
    expect(mocks.findGlobal).toHaveBeenCalledTimes(2)
    expect(mocks.findGlobal).toHaveBeenCalledWith(expect.objectContaining({ overrideAccess: false, draft: false }))
  })
  it('separates collection, slug and depth without exposing drafts', async () => {
    await getCachedDocument('pages', 'example', 0)()
    await getCachedDocument('posts', 'example', 0)()
    await getCachedDocument('pages', 'example', 2)()
    expect(mocks.find).toHaveBeenCalledTimes(3)
    expect(mocks.find).toHaveBeenCalledWith(expect.objectContaining({ overrideAccess: false, draft: false }))
  })
  it('separates redirect depths and respects public access', async () => {
    await getCachedRedirects(0)()
    await getCachedRedirects(1)()
    expect(mocks.find).toHaveBeenCalledTimes(2)
    expect(mocks.find).toHaveBeenCalledWith(expect.objectContaining({ overrideAccess: false }))
  })
})
