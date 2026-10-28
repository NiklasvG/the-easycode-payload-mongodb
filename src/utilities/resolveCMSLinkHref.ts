import type { Page, Post } from '@/payload-types'
import { getPagePath } from './contentPaths'

export type CMSLinkTarget = {
  type?: 'custom' | 'reference' | null
  url?: string | null
  reference?: { relationTo: 'pages' | 'posts'; value: Page | Post | string | number } | null
}

export function resolveCMSLinkHref({ type, url, reference }: CMSLinkTarget): string | null {
  if (type === 'custom' || (!type && url)) {
    const href = url?.trim()
    if (!href) return null
    if (!/^(https?:)?\/\//i.test(href)) return href

    try {
      const target = new URL(href, 'https://the-easycode.eu')
      if (
        (target.protocol === 'https:' || target.protocol === 'http:') &&
        (target.hostname === 'the-easycode.eu' || target.hostname === 'www.the-easycode.eu') &&
        !target.port &&
        !target.username &&
        !target.password &&
        !target.pathname.startsWith('//')
      ) {
        return `${target.pathname}${target.search}${target.hash}`
      }
    } catch {
      // Preserve custom targets that cannot be parsed as URLs.
    }

    return href
  }
  const doc = reference?.value
  if (type !== 'reference' || !doc || typeof doc !== 'object' || !doc.slug) return null
  return reference.relationTo === 'pages'
    ? getPagePath(doc as Page)
    : `/posts/${encodeURIComponent(doc.slug)}`
}
