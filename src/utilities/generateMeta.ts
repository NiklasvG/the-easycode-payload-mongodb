import type { Metadata } from 'next'
import type { Page, Project } from '@/payload-types'
import { mergeOpenGraph } from './mergeOpenGraph'
import { getPagePath, getProjectPath } from './contentPaths'
import {
  absoluteSEOURL, getSEODescription, getSEOImage, getSEOTitle, isNoIndex,
  type SEOCollection, type SEODocument,
} from './seo'

export function getContentPath(doc: SEODocument | null, collection: SEOCollection = 'pages'): string {
  if (!doc) return '/'
  if (collection === 'posts') return `/posts/${encodeURIComponent(doc.slug || '')}`
  if (collection === 'projects') return getProjectPath(doc as Partial<Project>) || '/projekte'
  return getPagePath(doc as Partial<Page>)
}

export const generateMeta = async ({ doc, collection = 'pages', preview = false }: {
  doc: SEODocument | null
  collection?: SEOCollection
  preview?: boolean
}): Promise<Metadata> => {
  if (!doc) return { robots: { index: false, follow: false } }
  const title = getSEOTitle(('meta' in doc ? doc.meta?.title : undefined) || doc.title)
  const description = getSEODescription(doc)
  const canonical = absoluteSEOURL(getContentPath(doc, collection))
  const media = getSEOImage(doc)
  const image = {
    url: absoluteSEOURL(media?.sizes?.og?.url || media?.url || '/website-template-OG.webp'),
    alt: media?.alt || doc.title || 'The-EasyCode',
  }
  const noIndex = preview || process.env.APP_ENV === 'staging' || doc._status === 'draft' || isNoIndex(doc)
  const publishedAt = collection === 'posts' && 'publishedAt' in doc ? doc.publishedAt : undefined
  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: !noIndex, follow: true,
      ...(!noIndex ? { googleBot: { index: true, follow: true, 'max-image-preview': 'large' as const, 'max-snippet': -1, 'max-video-preview': -1 } } : {}),
    },
    openGraph: mergeOpenGraph({
      title, description, url: canonical, images: [image],
      ...(collection === 'posts' ? {
        type: 'article', publishedTime: publishedAt || undefined, modifiedTime: doc.updatedAt,
      } : { type: 'website' }),
    }),
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}
