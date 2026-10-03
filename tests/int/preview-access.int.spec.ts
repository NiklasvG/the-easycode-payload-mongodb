// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
const mocks = vi.hoisted(() => ({ draftMode: vi.fn(), headers: vi.fn() }))
vi.mock('next/headers', () => mocks)
import { getPreviewAccess } from '@/utilities/getPreviewAccess'
const auth = vi.fn()
const payload = { auth } as unknown as Payload
beforeEach(() => { vi.clearAllMocks(); mocks.draftMode.mockResolvedValue({ isEnabled: true }); mocks.headers.mockResolvedValue(new Headers()) })
it('a remaining bypass cookie does not reveal drafts after logout', async () => {
  auth.mockResolvedValue({ user: null })
  expect(await getPreviewAccess(payload)).toBe(false)
})
it('accepts a bypass cookie only together with current authentication', async () => {
  auth.mockResolvedValue({ user: { id: 'editor' } })
  expect(await getPreviewAccess(payload)).toBe(true)
})
it('does not authenticate ordinary public requests', async () => {
  mocks.draftMode.mockResolvedValue({ isEnabled: false })
  expect(await getPreviewAccess(payload)).toBe(false)
  expect(auth).not.toHaveBeenCalled()
})
