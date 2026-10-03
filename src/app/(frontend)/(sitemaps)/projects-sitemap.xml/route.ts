import { connection } from 'next/server'
import { getCachedSitemap, sitemapResponse } from '@/utilities/sitemaps'
export async function GET() {
  await connection()
  return sitemapResponse(await getCachedSitemap('projects'))
}
