// @vitest-environment node
import { expect, it } from 'vitest'
import { generateMeta } from '@/utilities/generateMeta'
import { formatProjectDateRange } from '@/utilities/projectPresentation'
import type { Page, Post, Project } from '@/payload-types'
it('canonical and OpenGraph URLs follow nested pages, posts and projects', async () => {
  const docs = [
    { collection: 'pages' as const, doc: { slug: 'child', title: 'Child', breadcrumbs: [{ url: '/parent/child' }] } as Page, path: '/parent/child' },
    { collection: 'posts' as const, doc: { slug: 'post', title: 'Post' } as Post, path: '/posts/post' },
    { collection: 'projects' as const, doc: { slug: 'project', title: 'Project', client: { slug: 'client' } } as Project, path: '/projekte/client/project' },
  ]
  for (const { collection, doc, path } of docs) {
    const meta = await generateMeta({ doc, collection })
    expect(meta.alternates?.canonical).toMatch(new RegExp(`${path}$`))
    expect(meta.openGraph?.url).toBe(meta.alternates?.canonical)
  }
})
it('absolute media URLs stay intact and invalid dates are omitted', async () => {
  const meta = await generateMeta({ doc: { meta: { image: { url: 'https://cdn.example.test/image.webp' } } } as Page })
  expect(meta.openGraph?.images).toEqual([{ url: 'https://cdn.example.test/image.webp', alt: 'The-EasyCode' }])
  expect(formatProjectDateRange('invalid', '2026-01-01')).toBeNull()
})
