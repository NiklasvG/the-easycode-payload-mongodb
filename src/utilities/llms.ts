import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getContentPath } from './generateMeta'
import { getSitemapOrigin } from './getSitemapOrigin'
import { getProjectPath } from './contentPaths'
import { getSEODescription, isNoIndex, siteName, type SEOCollection } from './seo'
import type { Project } from '@/payload-types'

const markdownText = (value: string) => value.replace(/\s+/g, ' ').replace(/[\\[\]<>*_`]/g, '\\$&').trim()

async function readIndex(collection: SEOCollection, origin: string): Promise<string[]> {
  const payload = await getPayload({ config })
  const lines: string[] = []
  let page = 1
  let totalPages = 1
  do {
    const result = await payload.find({
      collection, overrideAccess: false, draft: false, depth: collection === 'projects' ? 1 : 0,
      limit: 500, page, sort: 'title', where: { _status: { equals: 'published' } },
      select: {
        slug: true, title: true, meta: true,
        ...(collection === 'pages' ? { breadcrumbs: true, hero: true } : {}),
        ...(collection === 'projects' ? { client: true, shortDescription: true } : {}),
      },
      ...(collection === 'projects' ? { populate: { clients: { slug: true } } } : {}),
    })
    for (const doc of result.docs) {
      if (!doc.slug || !doc.title || isNoIndex(doc)) continue
      if (collection === 'projects' && !getProjectPath(doc as Partial<Project>)) continue
      const url = new URL(getContentPath(doc, collection), origin)
      if (url.origin !== origin) continue
      const description = getSEODescription(doc)
      lines.push(`- [${markdownText(doc.title)}](<${url.href}>)${description ? `: ${markdownText(description)}` : ''}`)
    }
    totalPages = result.totalPages
    page++
  } while (page <= totalPages)
  return [...new Set(lines)]
}

export function getCachedLLMsIndex() {
  const origin = getSitemapOrigin()
  return unstable_cache(async () => {
    const sections = await Promise.all((['pages', 'posts', 'projects'] as const).map(async collection => {
      const lines = await readIndex(collection, origin)
      const title = { pages: 'Seiten', posts: 'Artikel', projects: 'Projekte' }[collection]
      return lines.length ? `## ${title}\n\n${lines.join('\n')}` : ''
    }))
    return `# ${siteName}\n\n> Verzeichnis der veröffentlichten Website-Inhalte.\n\nDie verlinkten HTML-Seiten sind die maßgeblichen Quellen. Dieses Verzeichnis enthält keine privaten CMS-Daten.\n\n${sections.filter(Boolean).join('\n\n')}\n`
  }, ['llms-index', origin], { tags: ['public-cms'], revalidate: 3600 })()
}
