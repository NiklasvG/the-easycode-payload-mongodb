import React, { act } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { Form } from '@payloadcms/plugin-form-builder/types'
import { FormBlock } from '@/blocks/Form/Component'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/components/RichText', () => ({ default: () => null }))
vi.mock('@/blocks/Form/fields', () => ({ fields: {} }))
vi.mock('@/utilities/getURL', () => ({ getClientSideURL: () => 'http://localhost:3000' }))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it.each(['', 'https://spam.example.test'])('sends the actual honeypot DOM value separately from CMS fields: %j', async (website) => {
  const fetchMock = vi.fn().mockResolvedValue({ status: 200, json: async () => ({}) })
  vi.stubGlobal('fetch', fetchMock)
  const { container } = render(React.createElement(FormBlock, {
    enableIntro: false,
    form: { id: 'test-form', fields: [], submitButtonLabel: 'Absenden', confirmationType: 'redirect' } as unknown as Form,
  }))
  const trap = container.querySelector<HTMLInputElement>('[data-form-honeypot]')!
  expect(trap.tabIndex).toBe(-1)
  expect(trap.parentElement?.getAttribute('aria-hidden')).toBe('true')
  expect(trap.autocomplete).toBe('off')
  // Bots may write DOM values directly without firing React input events.
  trap.value = website
  await act(async () => {
    container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  })
  expect(fetchMock.mock.calls.length).toBe(1)
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
    form: 'test-form', website, submissionData: [],
  })
})
