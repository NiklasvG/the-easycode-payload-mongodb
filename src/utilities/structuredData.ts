import type { Page, Post } from '@/payload-types'
import { getContentPath } from './generateMeta'
import { absoluteSEOURL, getSEODescription, getSEOImage, siteName, type SEOCollection, type SEODocument } from './seo'

export type Breadcrumb = { name: string; path: string }

export function getContentBreadcrumbs(doc: SEODocument, collection: SEOCollection): Breadcrumb[] {
  const path = getContentPath(doc, collection)
  if (path === '/') return []
  const items: Breadcrumb[] = [{ name: 'Startseite', path: '/' }]
  if (collection === 'pages') {
    for (const crumb of (doc as Partial<Page>).breadcrumbs || []) {
      if (crumb.label && crumb.url?.startsWith('/') && !crumb.url.startsWith('//') && crumb.url !== path && crumb.url !== '/' && crumb.url !== '/home') {
        items.push({ name: crumb.label, path: crumb.url })
      }
    }
  } else if (collection === 'projects') {
    // Clients have no public landing page. Do not invent a /projekte/<client> URL.
    items.push({ name: 'Projekte', path: '/projekte' })
  }
  items.push({ name: doc.title || siteName, path })
  return items
}

export function getSiteStructuredData() {
  const url = absoluteSEOURL('/')
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${url}#organization`, name: siteName, url },
      { '@type': 'WebSite', '@id': `${url}#website`, name: siteName, url, inLanguage: 'de-DE', publisher: { '@id': `${url}#organization` } },
    ],
  }
}

export function getContentStructuredData(doc: SEODocument, collection: SEOCollection) {
  const url = absoluteSEOURL(getContentPath(doc, collection))
  const home = absoluteSEOURL('/')
  const breadcrumbs = getContentBreadcrumbs(doc, collection)
  const media = getSEOImage(doc)
  const image = media?.url ? absoluteSEOURL(media.url) : undefined
  const contentID = `${url}#content`
  const breadcrumbID = `${url}#breadcrumb`
  const page = {
    '@type': 'WebPage', '@id': `${url}#webpage`, url, name: doc.title,
    description: getSEODescription(doc), inLanguage: 'de-DE',
    isPartOf: { '@id': `${home}#website` },
    ...(breadcrumbs.length > 1 ? { breadcrumb: { '@id': breadcrumbID } } : {}),
    ...(image ? { primaryImageOfPage: { '@type': 'ImageObject', url: image } } : {}),
    ...(collection !== 'pages' ? { mainEntity: { '@id': contentID } } : {}),
  }
  const content = collection === 'posts' ? {
    '@type': 'BlogPosting', '@id': contentID, headline: doc.title, url,
    description: getSEODescription(doc), image, inLanguage: 'de-DE',
    datePublished: (doc as Partial<Post>).publishedAt || undefined,
    dateModified: doc.updatedAt,
    author: (doc as Partial<Post>).populatedAuthors?.filter(author => author.name?.trim()).map(author => ({ '@type': 'Person', name: author.name })),
    publisher: { '@id': `${home}#organization` },
    mainEntityOfPage: { '@id': `${url}#webpage` },
  } : collection === 'projects' ? {
    '@type': 'CreativeWork', '@id': contentID, name: doc.title, url,
    description: getSEODescription(doc), image, inLanguage: 'de-DE',
    mainEntityOfPage: { '@id': `${url}#webpage` },
    // A case study is not a Product or Review. No invented prices, ratings or publication dates.
  } : undefined
  return {
    '@context': 'https://schema.org',
    '@graph': [page, ...(content ? [content] : []), ...(breadcrumbs.length > 1 ? [{
      '@type': 'BreadcrumbList', '@id': breadcrumbID,
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem', position: index + 1, name: crumb.name, item: absoluteSEOURL(crumb.path),
      })),
    }] : [])],
  }
}

export function serializeStructuredData(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
