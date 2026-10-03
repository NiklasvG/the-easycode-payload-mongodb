// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
import { validateFormSubmission } from '@/hooks/validateFormSubmission'
const findByID = vi.fn()
const submit = (submissionData: unknown) => validateFormSubmission({ operation: 'create', data: { form: 'test-form', submissionData }, req: { headers: new Headers(), payload: { findByID } } } as unknown as Parameters<typeof validateFormSubmission>[0])
beforeEach(() => findByID.mockResolvedValue({ fields: [{ blockType: 'email', name: 'email', required: true }, { blockType: 'checkbox', name: 'consent', required: true }] }))
it('accepts defined required fields', async () => {
  expect(await submit([{ field: 'email', value: 'visitor@example.test' }, { field: 'consent', value: 'true' }])).toEqual({ form: 'test-form', submissionData: [{ field: 'email', value: 'visitor@example.test' }, { field: 'consent', value: 'true' }] })
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
