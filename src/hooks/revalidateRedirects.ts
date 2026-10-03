import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateRedirects: CollectionAfterChangeHook & CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc
  payload.logger.info(`Revalidating redirects`)

  revalidateTag('redirects', { expire: 0 })

  return doc
}
