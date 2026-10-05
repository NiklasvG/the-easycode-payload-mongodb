// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Media, Page, Post, Project } from '@/payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import { getSEODescription, lexicalText } from '@/utilities/seo'
import { getContentBreadcrumbs, getContentStructuredData, serializeStructuredData } from '@/utilities/structuredData'

describe('CMS SEO metadata and structured data', () => {
  beforeEach(() => { vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://example.test/'); vi.stubEnv('APP_ENV', 'production') })

  it('uses one brand suffix and the nested canonical across social metadata', async () => {
    const meta = await generateMeta({ doc: { title: 'Website', slug: 'child', breadcrumbs: [{ url: '/parent/child' }], meta: { title: 'Website | The-EasyCode' } } })
    expect(meta.title).toBe('Website | The-EasyCode')
    expect(meta.alternates?.canonical).toBe('https://example.test/parent/child')
    expect(meta.openGraph).toMatchObject({ url: 'https://example.test/parent/child', locale: 'de_DE' })
    expect(meta.twitter).toMatchObject({ title: meta.title, card: 'summary_large_image' })
  })

  it('keeps previews, drafts, staging and editorial exclusions out of the index', async () => {
    expect((await generateMeta({ doc: { title: 'Page' }, preview: true })).robots).toMatchObject({ index: false })
    expect((await generateMeta({ doc: { title: 'Page', _status: 'draft' } })).robots).toMatchObject({ index: false })
    expect((await generateMeta({ doc: { title: 'Page', meta: { noIndex: true } } })).robots).toMatchObject({ index: false })
    vi.stubEnv('APP_ENV', 'staging')
    expect((await generateMeta({ doc: { title: 'Page' } })).robots).toMatchObject({ index: false })
  })

  it('uses CMS hero images and descriptions when SEO fields are empty', async () => {
    const image = { url: '/api/media/file/hero.webp', mimeType: 'image/webp', alt: 'Projektansicht' } as Media
    const meta = await generateMeta({ doc: { title: 'Case Study', slug: 'project', client: { slug: 'client' } as Project['client'], shortDescription: 'Ergebnis', heroImage: image }, collection: 'projects' })
    expect(meta.description).toBe('Ergebnis')
    expect(meta.openGraph).toMatchObject({ images: [{ url: 'https://example.test/api/media/file/hero.webp', alt: 'Projektansicht' }] })
    expect(meta.alternates?.canonical).toBe('https://example.test/projekte/client/project')
    expect(getSEODescription({ hero: { description: 'Aus dem sichtbaren Hero' } } as Partial<Page>)).toBe('Aus dem sichtbaren Hero')
  })

  it('extracts only visible Lexical text without relation data', () => {
    expect(lexicalText({ root: { children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Hallo ' }, { type: 'text', text: 'Welt' }] }, { type: 'relationship', value: { email: 'private@example.test' } }] } })).toBe('Hallo Welt')
  })

  it('uses public article authors, dates and the real project route hierarchy', () => {
    const post = { title: 'Artikel', slug: 'artikel', publishedAt: '2026-01-01', updatedAt: '2026-02-01', populatedAuthors: [{ name: 'Autor' }] } as Partial<Post>
    const data = getContentStructuredData(post, 'posts')
    expect(data['@graph']).toContainEqual(expect.objectContaining({ '@type': 'BlogPosting', datePublished: '2026-01-01', dateModified: '2026-02-01', author: [{ '@type': 'Person', name: 'Autor' }] }))
    const project = { title: 'Projekt', slug: 'projekt', client: { slug: 'kunde' } } as Partial<Project>
    expect(getContentBreadcrumbs(project, 'projects').map(item => item.path)).toEqual(['/', '/projekte', '/projekte/kunde/projekt'])
    expect(getContentStructuredData(project, 'projects')['@graph']).toContainEqual(expect.objectContaining({ '@type': 'CreativeWork' }))
  })

  it('prevents CMS content from closing a JSON-LD script element', () => {
    const title = '</script><script>alert(1)</script>'
    const serialized = serializeStructuredData(getContentStructuredData({ title, slug: 'test' }, 'pages'))
    expect(serialized).not.toContain('<')
    expect(JSON.parse(serialized)['@graph'][0].name).toBe(title)
  })
})
