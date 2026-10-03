// Integration candidate; requires cacheComponents and a runtime boundary before invocation.
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'
import config from '../src/payload.config'

export async function getPublicProject(slug: string, clientSlug: string) {
  'use cache'
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 })
  cacheTag('public-cms', `projects_${slug}`)
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'projects', overrideAccess: false, draft: false, depth: 1, limit: 1,
    where: { and: [{ slug: { equals: slug } }, { 'client.slug': { equals: clientSlug } }] },
  })
  return result.docs[0] ?? null
}
