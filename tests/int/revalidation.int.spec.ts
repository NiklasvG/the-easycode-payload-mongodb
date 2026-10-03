// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PayloadRequest } from 'payload'
import type { Page, Post } from '@/payload-types'
const mocks = vi.hoisted(() => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))
vi.mock('next/cache', () => mocks)
import {
  revalidatePage,
  revalidateDelete as deletePage,
} from '@/collections/Pages/hooks/revalidatePage'
import { revalidatePost } from '@/collections/Posts/hooks/revalidatePost'
import { revalidateRelatedContent } from '@/hooks/revalidateRelatedContent'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
const req = { context: {}, payload: { logger: { info: vi.fn() } } } as unknown as PayloadRequest
const page = (slug: string, status = 'published') => ({ slug, _status: status }) as Page

describe('CMS invalidation', () => {
  beforeEach(() => vi.clearAllMocks())
  it('invalidates both URLs on a published slug change', async () => {
    await revalidatePage({ doc: page('new'), previousDoc: page('old'), req } as Parameters<
      typeof revalidatePage
    >[0])
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/new')
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/old')
    expect(mocks.revalidateTag).toHaveBeenCalledWith('public-cms', { expire: 0 })
  })
  it('invalidates home when withdrawn and on deletion', async () => {
    await revalidatePage({
      doc: page('home', 'draft'),
      previousDoc: page('home'),
      req,
    } as Parameters<typeof revalidatePage>[0])
    await deletePage({ doc: page('home'), req } as Parameters<typeof deletePage>[0])
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/')
  })
  it('handles creating a post without a previous document', async () => {
    await revalidatePost({ doc: { slug: 'new', _status: 'published' } as Post, req } as Parameters<
      typeof revalidatePost
    >[0])
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/posts/new')
  })
  it('does not invalidate for an unpublished draft', async () => {
    await revalidatePage({ doc: page('draft', 'draft'), req } as Parameters<
      typeof revalidatePage
    >[0])
    expect(mocks.revalidatePath).not.toHaveBeenCalled()
  })
  it('invalidates all relationship consumers after media/client mutations', async () => {
    await revalidateRelatedContent({ doc: {}, req } as Parameters<
      typeof revalidateRelatedContent
    >[0])
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/', 'layout')
    expect(mocks.revalidateTag).toHaveBeenCalledWith('public-cms', { expire: 0 })
  })
  it('invalidates removed redirects and respects import suppression', async () => {
    await revalidateRedirects({ doc: {}, req } as Parameters<typeof revalidateRedirects>[0])
    expect(mocks.revalidateTag).toHaveBeenCalledWith('redirects', { expire: 0 })
    vi.clearAllMocks()
    await revalidateRelatedContent({
      doc: {},
      req: { ...req, context: { disableRevalidate: true } },
    } as unknown as Parameters<typeof revalidateRelatedContent>[0])
    expect(mocks.revalidateTag).not.toHaveBeenCalled()
  })
})

