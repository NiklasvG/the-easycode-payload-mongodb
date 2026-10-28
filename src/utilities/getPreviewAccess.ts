import { draftMode, headers } from 'next/headers'
import type { Payload } from 'payload'

/** A bypass cookie alone never grants access to drafts after logout/token expiry. */
export async function getPreviewAccess(payload: Payload): Promise<boolean> {
  if (!(await draftMode()).isEnabled) return false
  try {
    return Boolean((await payload.auth({ headers: await headers() })).user)
  } catch {
    return false
  }
}
