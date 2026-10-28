import { APIError, type CollectionBeforeValidateHook } from 'payload'
import type { FormSubmission } from '@/payload-types'
import { createRequestLimiter, hasAllowedOrigin } from '@/utilities/publicRequestLimits'
const allowSubmission = createRequestLimiter(60, 5)

/** Public submissions may contain only the fields defined by the selected form. */
export const validateFormSubmission: CollectionBeforeValidateHook<FormSubmission> = async ({ data, operation, req }) => {
  if (operation !== 'create') return data
  if (!req.user) {
    if (!hasAllowedOrigin(req)) throw new APIError('Origin not allowed', 403)
    if (!allowSubmission(req.headers)) throw new APIError('Too many submissions', 429)
  }
  const reject = () => { throw new APIError('Invalid form submission', 400) }
  // Transport-only honeypot: reject before database lookup, storage or email hooks.
  // Missing values remain valid for existing API clients; bots can bypass this layer.
  const website = (data as { website?: unknown } | undefined)?.website
  if (website !== undefined && website !== '') return reject()
  if (!data || typeof data.form !== 'string' || !Array.isArray(data.submissionData) || data.submissionData.length > 50) return reject()
  const form = await req.payload.findByID({ collection: 'forms', id: data.form, depth: 0, overrideAccess: false, req })
  const fields = new Map((form.fields || []).flatMap((field) => 'name' in field && field.name ? [[field.name, field] as const] : []))
  const seen = new Set<string>()
  let bytes = 0
  for (const item of data.submissionData) {
    if (!item || typeof item.field !== 'string' || typeof item.value !== 'string' || seen.has(item.field)) return reject()
    const field = fields.get(item.field)
    if (!field || /[\r\n]/.test(item.field) || item.value.length > 4000) return reject()
    if (field.blockType === 'email' && item.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.value)) return reject()
    if (field.blockType === 'select' && item.value && !field.options?.some((option) => option.value === item.value)) return reject()
    if (field.blockType === 'number' && item.value && !Number.isFinite(Number(item.value))) return reject()
    if (field.blockType === 'checkbox' && !['true', 'false'].includes(item.value)) return reject()
    bytes += Buffer.byteLength(item.value)
    seen.add(item.field)
  }
  if (bytes > 16000) return reject()
  for (const [name, field] of fields) {
    if ('required' in field && field.required) {
      const value = data.submissionData.find((item) => item.field === name)?.value
      if (!value?.trim() || (field.blockType === 'checkbox' && value !== 'true')) return reject()
    }
  }
  return { form: data.form, submissionData: data.submissionData.map(({ field, value }) => ({ field, value })) }
}
