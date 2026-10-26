import React from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { Form } from '@payloadcms/plugin-form-builder/types'
import { FormBlock } from '@/blocks/Form/Component'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/components/RichText', () => ({ default: () => null }))
vi.mock('@/utilities/getURL', () => ({ getClientSideURL: () => 'http://localhost:3000' }))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const fixture = (extra: Record<string, unknown> = {}) =>
  ({
    id: 'local-regression-form',
    confirmationType: 'message',
    submitButtonLabel: 'Absenden',
    fields: [
      {
        blockType: 'text',
        name: 'visitor',
        label: 'Projektverantwortliche',
        width: 25,
        required: true,
      },
      { blockType: 'email', name: 'email', label: 'E-Mail', width: 75, required: true },
      { blockType: 'textarea', name: 'message', label: 'Nachricht', width: 100 },
    ],
    ...extra,
  }) as unknown as Form

const fill = () => {
  fireEvent.change(screen.getByLabelText(/Projektverantwortliche/), {
    target: { value: 'Aleksandra Wiśniewska-Kowalczyk 👩🏽‍💻' },
  })
  fireEvent.change(screen.getByLabelText(/E-Mail/), {
    target: { value: 'bartholomew.fitzgerald@northwind-industries-holdings.example.com' },
  })
}

it('links field errors to inputs, retains accessible focus and stacks narrow CMS columns on mobile', async () => {
  vi.stubGlobal('fetch', vi.fn())
  const { container } = render(
    React.createElement(FormBlock, { enableIntro: false, form: fixture() }),
  )
  fireEvent.submit(container.querySelector('form')!)
  const input = screen.getByLabelText(/Projektverantwortliche/)
  await waitFor(() => expect(input.getAttribute('aria-invalid')).toBe('true'))
  expect(input.getAttribute('aria-describedby')).toBe('visitor-error')
  expect(document.getElementById('visitor-error')?.textContent).toContain('Bitte fülle')
  expect(document.activeElement).toBe(input)
  expect(input.closest('.col-span-1')?.className).toContain('sm:col-span-3')
  expect(input.closest('.grid')?.className).toContain('grid-cols-1 sm:grid-cols-12')
  expect(fetch).not.toHaveBeenCalled()
})

it('keeps long values after a non-JSON failure and focuses a German retry message', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Bad gateway', { status: 502 })))
  const { container } = render(
    React.createElement(FormBlock, { enableIntro: false, form: fixture() }),
  )
  fill()
  fireEvent.submit(container.querySelector('form')!)
  const alert = await screen.findByRole('alert')
  expect(alert.textContent).toContain('Bitte prüfe deine Angaben')
  await waitFor(() => expect(document.activeElement).toBe(alert))
  expect((screen.getByLabelText(/E-Mail/) as HTMLInputElement).value).toContain(
    'northwind-industries-holdings',
  )
  expect((screen.getByRole('button', { name: 'Absenden' }) as HTMLButtonElement).disabled).toBe(
    false,
  )
})

it('rejects whitespace-only required fields before creating a submission', async () => {
  vi.stubGlobal('fetch', vi.fn())
  const { container } = render(
    React.createElement(FormBlock, { enableIntro: false, form: fixture() }),
  )
  fill()
  fireEvent.change(screen.getByLabelText(/Projektverantwortliche/), { target: { value: '   ' } })
  fireEvent.submit(container.querySelector('form')!)
  await screen.findByRole('alert')
  expect(fetch).not.toHaveBeenCalled()
})

it('prevents duplicate submissions, names the pending state and announces success', async () => {
  let complete!: (response: Response) => void
  const pending = new Promise<Response>((resolve) => {
    complete = resolve
  })
  vi.stubGlobal('fetch', vi.fn().mockReturnValue(pending))
  const { container } = render(
    React.createElement(FormBlock, { enableIntro: false, form: fixture() }),
  )
  fill()
  const form = container.querySelector('form')!
  fireEvent.submit(form)
  await screen.findByRole('button', { name: 'Wird gesendet …' })
  fireEvent.submit(form)
  expect(fetch).toHaveBeenCalledTimes(1)
  await act(async () => {
    complete(new Response('{}'))
  })
  const status = await screen.findByRole('status')
  expect(status.textContent).toContain('Nachricht gesendet!')
  expect(document.activeElement).toBe(status)
})

it('honors the backend text boundary and keeps empty and single-field forms renderable', () => {
  const { rerender } = render(
    React.createElement(FormBlock, { enableIntro: false, form: fixture({ fields: [] }) }),
  )
  expect(screen.getByRole('button', { name: 'Absenden' })).toBeTruthy()
  const fields = [
    {
      blockType: 'textarea',
      name: 'description',
      label: 'Projektbeschreibung',
      defaultValue: '王秀英 benötigt eine barrierefreie Website. '.repeat(80),
    },
  ]
  rerender(React.createElement(FormBlock, { enableIntro: false, form: fixture({ fields }) }))
  expect((screen.getByLabelText('Projektbeschreibung') as HTMLTextAreaElement).maxLength).toBe(4000)
  rerender(
    React.createElement(FormBlock, {
      enableIntro: false,
      form: fixture({ fields: [{ blockType: 'text', name: 'Kontaktname' }] }),
    }),
  )
  expect(screen.getByRole('textbox', { name: 'Kontaktname' })).toBeTruthy()
})
