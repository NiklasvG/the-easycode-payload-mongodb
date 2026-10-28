import { revalidatePath, revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

/** Relationships may occur in any CMS block or global; invalidate conservatively. */
export const revalidateRelatedContent: CollectionAfterChangeHook & CollectionAfterDeleteHook = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidateTag('public-cms', { expire: 0 })
    revalidatePath('/', 'layout')
  }
  return doc
}
