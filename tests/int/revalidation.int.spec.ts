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
import { revalidateProject, revalidateDelete as deleteProject } from '@/collections/Projects/hooks/revalidateProject'
import { revalidateHeader } from '@/Header/hooks/revalidateHeader'
import { revalidateFooter } from '@/Footer/hooks/revalidateFooter'
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
  it('refreshes prerendered consumers when pages, posts and projects change', async () => {
    await revalidatePage({ doc: page('published'), req } as Parameters<typeof revalidatePage>[0])
    await revalidatePost({ doc: { slug: 'post', _status: 'published' } as Post, req } as Parameters<typeof revalidatePost>[0])
    const project = { slug: 'project', _status: 'published', client: { id: 'client', slug: 'client' } }
    await revalidateProject({ doc: project, req } as unknown as Parameters<typeof revalidateProject>[0])
    expect(mocks.revalidatePath.mock.calls.filter(([path, type]) => path === '/' && type === 'layout')).toHaveLength(3)
    vi.clearAllMocks()
    await deleteProject({ doc: project, req } as unknown as Parameters<typeof deleteProject>[0])
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })
  it('refreshes all prerendered pages after header and footer changes', async () => {
    await revalidateHeader({ doc: {}, req } as Parameters<typeof revalidateHeader>[0])
    await revalidateFooter({ doc: {}, req } as Parameters<typeof revalidateFooter>[0])
    expect(mocks.revalidatePath.mock.calls.filter(([path, type]) => path === '/' && type === 'layout')).toHaveLength(2)
    expect(mocks.revalidateTag).toHaveBeenCalledWith('global_header', { expire: 0 })
    expect(mocks.revalidateTag).toHaveBeenCalledWith('global_footer', { expire: 0 })
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

