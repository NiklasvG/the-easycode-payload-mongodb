import type { MetadataRoute } from 'next'
import { getCachedSitemap } from '@/utilities/sitemaps'
export const dynamic = 'force-dynamic'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sources = await Promise.all([getCachedSitemap('pages'), getCachedSitemap('posts'), getCachedSitemap('projects')])
  return [...new Map(sources.flat().map(entry => [entry.url, entry])).values()]
}
