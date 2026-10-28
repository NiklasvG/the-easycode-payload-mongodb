import type { MetadataRoute } from 'next'
import { getCachedSitemap } from '@/utilities/sitemaps'
import { connection } from 'next/server'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection()
  const sources = await Promise.all([getCachedSitemap('pages'), getCachedSitemap('posts'), getCachedSitemap('projects')])
  return [...new Map(sources.flat().map(entry => [entry.url, entry])).values()]
}
