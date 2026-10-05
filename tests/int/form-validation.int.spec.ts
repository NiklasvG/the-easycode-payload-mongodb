// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
import { validateFormSubmission } from '@/hooks/validateFormSubmission'
const findByID = vi.fn()
const submit = (submissionData: unknown, extra: Record<string, unknown> = {}) => validateFormSubmission({ operation: 'create', data: { form: 'test-form', submissionData, ...extra }, req: { headers: new Headers(), payload: { findByID } } } as unknown as Parameters<typeof validateFormSubmission>[0])
beforeEach(() => {
  findByID.mockClear()
  findByID.mockResolvedValue({ fields: [{ blockType: 'email', name: 'email', required: true }, { blockType: 'checkbox', name: 'consent', required: true }] })
})
it('accepts defined required fields', async () => {
  expect(await submit([{ field: 'email', value: 'visitor@example.test' }, { field: 'consent', value: 'true' }])).toEqual({ form: 'test-form', submissionData: [{ field: 'email', value: 'visitor@example.test' }, { field: 'consent', value: 'true' }] })
})
it('accepts an empty honeypot without storing it or removing a real website field', async () => {
  findByID.mockResolvedValue({ fields: [{ blockType: 'text', name: 'website' }] })
  const submissionData = [{ field: 'website', value: 'https://example.test' }]
  expect(await submit(submissionData, { website: '' })).toEqual({ form: 'test-form', submissionData })
})
it.each(['https://spam.test', ' ', null, 42, {}, []])('rejects a filled or malformed honeypot before looking up the form: %j', async (website) => {
  await expect(submit([], { website })).rejects.toThrow('Invalid form submission')
  expect(findByID.mock.calls.length).toBe(0)
})
it.each([
  [{ field: 'emailTo', value: 'attacker@example.test' }],
  [{ field: 'email', value: 'invalid\naddress' }],
  [{ field: 'email', value: 'visitor@example.test' }, { field: 'consent', value: 'false' }],
  [{ field: 'email', value: 'visitor@example.test' }, { field: 'email', value: 'another@example.test' }],
  [{ field: 'email', value: 'x'.repeat(4001) }],
])('rejects invalid or forged submission %j', async (...items) => {
  await expect(submit(items)).rejects.toThrow('Invalid form submission')
})
