import type { Metadata } from 'next'
import type { Media, Page, Post, Project, Config } from '@/payload-types'
import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import { getPagePath, getProjectPath } from './contentPaths'

export function getContentPath(doc: Partial<Page> | Partial<Post> | Partial<Project> | null, collection: 'pages' | 'posts' | 'projects' = 'pages'): string {
  if (!doc) return '/'
  if (collection === 'posts') return `/posts/${encodeURIComponent(doc.slug || '')}`
  if (collection === 'projects') return getProjectPath(doc as Partial<Project>) || '/projekte'
  return getPagePath(doc as Partial<Page>)
}

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()
  const path = image && typeof image === 'object' ? image.sizes?.og?.url || image.url : null
  return new URL(path || '/website-template-OG.webp', serverUrl).href
}

export const generateMeta = async ({ doc, collection = 'pages' }: {
  doc: Partial<Page> | Partial<Post> | Partial<Project> | null
  collection?: 'pages' | 'posts' | 'projects'
}): Promise<Metadata> => {
  if (!doc) return { robots: { index: false, follow: false } }
  const meta = doc && 'meta' in doc ? doc.meta : undefined
  const title = `${meta?.title || doc?.title || 'The-EasyCode'}${meta?.title || doc?.title ? ' | The-EasyCode' : ''}`
  const description = meta?.description || (doc && 'shortDescription' in doc ? doc.shortDescription : undefined)
  const canonical = new URL(getContentPath(doc, collection), getServerSideURL()).href
  return {
    title, description,
    alternates: { canonical },
    openGraph: mergeOpenGraph({ title, description: description || '', url: canonical, images: [{ url: getImageURL(meta?.image) }] }),
  }
}
