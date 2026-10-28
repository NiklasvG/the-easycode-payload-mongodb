import type { Media, Page, Post, Project } from '@/payload-types'
import { getSitemapOrigin } from './getSitemapOrigin'

export type SEOCollection = 'pages' | 'posts' | 'projects'
export type SEODocument = Partial<Page> | Partial<Post> | Partial<Project>
export const siteName = 'The-EasyCode'
export const siteDescription = 'Ihr Freelancer für Webentwicklung aus Dresden!'

export function getSEOTitle(title?: string | null): string {
  const value = title?.trim()
  if (!value) return siteName
  return value === siteName || /\|\s*The-EasyCode\s*$/i.test(value) ? value : `${value} | ${siteName}`
}

// Only traverse Lexical text nodes, never uploads, relationships or block internals.
export function lexicalText(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const node = value as { root?: unknown; type?: string; text?: unknown; children?: unknown[] }
  if (node.root) return lexicalText(node.root)
  if (node.type === 'text' && typeof node.text === 'string') return node.text
  if (!Array.isArray(node.children)) return ''
  const separator = ['paragraph', 'heading', 'link', 'autolink'].includes(node.type || '') ? '' : ' '
  return node.children.map(lexicalText).join(separator).trim()
}

export function getSEODescription(doc: SEODocument): string | undefined {
  const authored = ('meta' in doc ? doc.meta?.description : undefined)?.trim()
  if (authored) return authored
  const fallback = 'shortDescription' in doc ? doc.shortDescription
    : 'hero' in doc ? doc.hero?.description?.trim() || lexicalText(doc.hero?.richText)
      : 'content' in doc ? lexicalText(doc.content) : undefined
  const text = fallback?.replace(/\s+/g, ' ').trim()
  if (!text) return undefined
  if (text.length <= 160) return text
  const excerpt = text.slice(0, 157)
  const boundary = excerpt.lastIndexOf(' ')
  return `${boundary > 100 ? excerpt.slice(0, boundary) : excerpt}…`
}

export function getSEOImage(doc: SEODocument): Media | undefined {
  const candidates = [
    'meta' in doc ? doc.meta?.image : undefined,
    'heroImage' in doc ? doc.heroImage : undefined,
    'image' in doc ? doc.image : undefined,
    'hero' in doc ? doc.hero?.media : undefined,
  ]
  return candidates.find((image): image is Media => Boolean(image && typeof image === 'object' && (!image.mimeType || image.mimeType.startsWith('image/')) && image.url))
}

export function absoluteSEOURL(path: string): string {
  return new URL(path, `${getSitemapOrigin()}/`).href
}

export function isNoIndex(doc: SEODocument): boolean {
  return Boolean('meta' in doc && doc.meta?.noIndex)
}
