import type { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'
import type { Client, Page, Post, Project } from '@/payload-types'
import { getPagePath } from '@/utilities/contentPaths'

export const beforeSyncWithSearch: BeforeSync = async ({ req, originalDoc, searchDoc }) => {
  const collection = searchDoc.doc.relationTo
  const doc = originalDoc as Page | Post | Project | Client
  const meta = 'meta' in doc ? doc.meta : undefined
  const modified: DocToSync = {
    ...searchDoc,
    title: 'companyName' in doc ? doc.companyName : doc.title,
    slug: collection === 'pages' ? getPagePath(doc as Page).replace(/^\//, '') : doc.slug,
    meta: { ...meta, title: meta?.title || ('companyName' in doc ? doc.companyName : doc.title), image: typeof meta?.image === 'object' ? meta.image?.id : meta?.image, description: meta?.description },
    categories: [], clientSlug: null, shortDescription: null, projectType: null,
    imageHint: null, startDate: null, endDate: null, image: null, tags: [],
  }
  if ('categories' in doc) {
    const categories = await Promise.all((doc.categories || []).map(async (category) => {
      const resolved = typeof category === 'object' ? category : await req.payload.findByID({ collection: 'categories', id: category, depth: 0, disableErrors: true, req })
      return resolved ? { relationTo: 'categories', categoryID: String(resolved.id), title: resolved.title } : null
    }))
    modified.categories = categories.filter((category) => category !== null)
  }
  if (collection === 'projects') {
    const project = doc as Project
    const client = typeof project.client === 'object' ? project.client : await req.payload.findByID({ collection: 'clients', id: project.client, depth: 0, disableErrors: true, req })
    Object.assign(modified, {
      clientSlug: client?.slug ?? null, shortDescription: project.shortDescription,
      projectType: project.projectType, imageHint: project.imageHint,
      startDate: project.startDate, endDate: project.endDate,
      image: typeof project.image === 'object' ? project.image?.id : project.image,
      tags: project.tags ?? [],
    })
  }
  return modified
}
