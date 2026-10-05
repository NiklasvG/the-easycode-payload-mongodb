import type { MetadataRoute } from 'next'
import type { Page, Project } from '@/payload-types'
import { getSitemapOrigin } from './getSitemapOrigin'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getContentPath } from './generateMeta'
import { isNoIndex } from './seo'

type Source = 'pages' | 'posts' | 'projects'

async function readSitemap(source: Source, origin: string): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const entries: MetadataRoute.Sitemap = []
  let page = 1
  let totalPages = 1
  do {
    const result = await payload.find({
      collection: source, overrideAccess: false, draft: false,
      depth: source === 'projects' ? 1 : 0, limit: 500, page,
      where: { _status: { equals: 'published' } },
      select: { slug: true, updatedAt: true, meta: true, ...(source === 'pages' ? { breadcrumbs: true } : {}), ...(source === 'projects' ? { client: true } : {}) },
      ...(source === 'projects' ? { populate: { clients: { slug: true } } } : {}),
    })
    for (const doc of result.docs) {
      if (!doc.slug || isNoIndex(doc)) continue
      let path: string
      if (source === 'projects') {
        const client = (doc as unknown as Pick<Project, 'client'>).client
        if (!client || typeof client !== 'object' || !client.slug) continue
        path = `/projekte/${encodeURIComponent(client.slug)}/${encodeURIComponent(doc.slug)}`
      } else if (source === 'posts') {
        path = `/posts/${encodeURIComponent(doc.slug)}`
      } else {
        path = getContentPath(doc as Partial<Page>, 'pages')
      }
      const url = new URL(path, origin)
      if (url.origin !== new URL(origin).origin) continue
      entries.push({ url: url.href, lastModified: doc.updatedAt })
    }
    totalPages = result.totalPages
    page++
  } while (page <= totalPages)
  return entries
}

export const getCachedSitemap = (source: Source) => {
  const origin = getSitemapOrigin()
  return unstable_cache(() => readSitemap(source, origin), ['sitemap', source, origin], {
    tags: ['public-cms', `${source}-sitemap`],
  })()
}
const xmlEscape = (value: string) => value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!)
export function sitemapResponse(entries: MetadataRoute.Sitemap) {
  const body = entries.map(entry => `<url><loc>${xmlEscape(entry.url)}</loc>${entry.lastModified ? `<lastmod>${xmlEscape(typeof entry.lastModified === 'string' ? entry.lastModified : entry.lastModified.toISOString())}</lastmod>` : ''}</url>`).join('')
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

