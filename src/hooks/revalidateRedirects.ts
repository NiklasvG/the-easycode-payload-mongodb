import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateRedirects: CollectionAfterChangeHook & CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc
  payload.logger.info(`Revalidating redirects`)

  revalidateTag('redirects', { expire: 0 })
  // Redirect responses are cached as routes too, including former missing pages.
  revalidatePath('/', 'layout')

  return doc
}
