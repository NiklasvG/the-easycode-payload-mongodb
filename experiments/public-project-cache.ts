// Not used in production: standalone Turbopack invalidation failed the slug lifecycle test.
// See docs/cache-components.md; resolve that regression before integration.
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'
import config from '../src/payload.config'

export async function getPublicProject(slug: string, clientSlug: string) {
  'use cache'
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 })
  cacheTag('public-cms', `projects_${slug}`)
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'projects', overrideAccess: false, draft: false, depth: 2, limit: 1,
    where: { slug: { equals: slug } },
  })
  const project = result.docs[0]
  const client = project?.client
  return client && typeof client === 'object' && client.slug === clientSlug ? project : null
}
