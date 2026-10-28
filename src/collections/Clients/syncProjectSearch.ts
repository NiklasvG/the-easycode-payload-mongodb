import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import type { Client } from '@/payload-types'

export const syncProjectSearch: CollectionAfterChangeHook<Client> = async ({ doc, previousDoc, req }) => {
  if (previousDoc?.slug === doc.slug) return doc
  let page = 1
  let totalPages = 1
  do {
    const projects = await req.payload.find({ collection: 'projects', req, depth: 0, limit: 100, page, where: { client: { equals: doc.id } }, select: { slug: true } })
    const ids = projects.docs.map((project) => project.id)
    if (ids.length) await req.payload.update({ collection: 'search', req, depth: 0, where: { and: [{ 'doc.relationTo': { equals: 'projects' } }, { 'doc.value': { in: ids } }] }, data: { clientSlug: doc.slug } })
    totalPages = projects.totalPages
    page++
  } while (page <= totalPages)
  return doc
}

export const removeClientProjectsFromSearch: CollectionAfterDeleteHook<Client> = async ({ doc, req }) => {
  await req.payload.delete({ collection: 'search', req, where: { and: [{ 'doc.relationTo': { equals: 'projects' } }, { clientSlug: { equals: doc.slug } }] } })
  return doc
}
