import { getCachedSitemap, sitemapResponse } from '@/utilities/sitemaps'
export async function GET() {
  return sitemapResponse(await getCachedSitemap('pages'))
}
