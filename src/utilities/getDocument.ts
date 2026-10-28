import type { Config } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

type Collection = Extract<keyof Config['collections'], 'pages' | 'posts' | 'projects'>

async function getDocument(collection: Collection, slug: string, depth = 0) {
  const payload = await getPayload({ config: configPromise })

  const page = await payload.find({
    collection,
    depth,
    overrideAccess: false,
    draft: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return page.docs[0]
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedDocument = (collection: Collection, slug: string, depth = 0) =>
  unstable_cache(async () => getDocument(collection, slug, depth), ['documents', collection, slug, String(depth)], {
    tags: ['public-cms', `${collection}_${slug}`],
  })
