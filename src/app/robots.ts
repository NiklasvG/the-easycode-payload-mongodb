import type { MetadataRoute } from 'next'
import { getSitemapOrigin } from '@/utilities/getSitemapOrigin'
export default function robots(): MetadataRoute.Robots {
  return {
    rules: process.env.APP_ENV === 'staging'
      ? { userAgent: '*', disallow: '/' }
      : { userAgent: '*', allow: ['/api/media/file/'], disallow: ['/admin', '/api/', '/next/'] },
    sitemap: `${getSitemapOrigin()}/sitemap.xml`,
  }
}

