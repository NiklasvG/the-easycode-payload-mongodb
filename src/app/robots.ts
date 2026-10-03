import type { MetadataRoute } from 'next'
import { getSitemapOrigin } from '@/utilities/getSitemapOrigin'
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', disallow: process.env.APP_ENV === 'staging' ? '/' : ['/admin/', '/api/', '/next/'] },
    sitemap: `${getSitemapOrigin()}/sitemap.xml`,
  }
}

