import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '../../../payload-types'
import { getPagePath } from '@/utilities/contentPaths'

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    revalidateTag('public-cms', { expire: 0 })
    if (doc._status === 'published' || previousDoc?._status === 'published') {
      // Other prerendered pages can link to or embed this document.
      revalidatePath('/', 'layout')
    }
    if (doc._status === 'published') {
      const path = getPagePath(doc)

      payload.logger.info(`Revalidating page at path: ${path}`)

      revalidatePath(path)
      revalidateTag('pages-sitemap', { expire: 0 })
    }

    // If the page was previously published, we need to revalidate the old path
    if (
      previousDoc?._status === 'published' &&
      (doc._status !== 'published' || getPagePath(doc) !== getPagePath(previousDoc))
    ) {
      const oldPath = getPagePath(previousDoc)

      payload.logger.info(`Revalidating old page at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidatePath('/', 'layout')
      revalidateTag('pages-sitemap', { expire: 0 })
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidateTag('public-cms', { expire: 0 })
    const path = getPagePath(doc)
    revalidatePath(path)
    revalidatePath('/', 'layout')
    revalidateTag('pages-sitemap', { expire: 0 })
  }

  return doc
}
