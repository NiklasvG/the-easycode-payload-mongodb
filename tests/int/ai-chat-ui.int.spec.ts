import React from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AIChat } from '@/components/Chat/AIChat'
vi.mock('next/link', () => ({
  default: ({ children, ...props }: React.ComponentProps<'a'>) =>
    React.createElement('a', props, children),
}))
const stream = (text: string) =>
  new Response(`${JSON.stringify({ type: 'delta', text })}\n{"type":"done"}\n`, {
    headers: { 'content-type': 'application/x-ndjson' },
  })
const confirm = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Einwilligen und Chat nutzen' }))
const send = (text = 'Welche Leistungen bietet Niklas?') => {
  fireEvent.change(screen.getByRole('textbox', { name: 'Deine Nachricht an den KI-Assistenten' }), {
    target: { value: text },
  })
  fireEvent.submit(screen.getByRole('button', { name: 'Nachricht senden' }).closest('form')!)
}
beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  Element.prototype.scrollIntoView = vi.fn()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(stream('Webentwicklung.')))
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
  localStorage.clear()
  sessionStorage.clear()
})

describe('AI chat privacy and interaction', () => {
  it('offers detailed privacy information without granting consent or contacting the provider', () => {
    sessionStorage.setItem(
      'easycode-ai-chat-consent',
      JSON.stringify({
        accepted: true,
        version: 'openai-consent-v1',
        acceptedAt: Date.now(),
        id: '11111111-1111-4111-8111-111111111111',
      }),
    )
    render(React.createElement(AIChat, { initiallyOpen: true }))
    const details = screen.getByRole('link', { name: 'Datenschutz zum KI-Chat (neuer Tab)' })
    expect(details.getAttribute('href')).toBe('/datenschutz/ki-chat')
    expect(details.getAttribute('target')).toBe('_blank')
    fireEvent.click(details)
    expect(fetch).not.toHaveBeenCalled()
    expect(sessionStorage.getItem('easycode-ai-chat-consent')).toBeNull()
    expect(
      (screen.getByRole('button', { name: 'Nachricht senden' }) as HTMLButtonElement).disabled,
    ).toBe(true)
  })
  it('automatically withdraws session consent when its 24-hour validity ends', () => {
    vi.useFakeTimers()
    render(React.createElement(AIChat, { initiallyOpen: true }))
    confirm()
    expect(sessionStorage.getItem('easycode-ai-chat-consent')).not.toBeNull()
    act(() => vi.advanceTimersByTime(86400000))
    expect(sessionStorage.getItem('easycode-ai-chat-consent')).toBeNull()
    expect(screen.getByRole('button', { name: 'Einwilligen und Chat nutzen' })).toBeTruthy()
    expect(fetch).not.toHaveBeenCalled()
  })
  it('requires active consent even if the old provider disclaimer was confirmed', async () => {
    localStorage.setItem('easycode-ai-chat-disclaimer-confirmed', 'openai-v1')
    render(React.createElement(AIChat, { initiallyOpen: true }))
    send()
    expect(fetch).not.toHaveBeenCalled()
    confirm()
    expect(localStorage.getItem('easycode-ai-chat-disclaimer-confirmed')).toBeNull()
    send()
    await screen.findByText('Webentwicklung.')
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string)
    expect(body.consent).toMatchObject({ accepted: true, version: 'openai-consent-v2' })
    expect(body.consent.id).toBeTruthy()
    expect(body.history).toEqual([])
    expect(sessionStorage.getItem('easycode-ai-chat-consent')).not.toContain('Webentwicklung')
    fireEvent.click(screen.getByRole('button', { name: 'Verlauf löschen' }))
    expect(screen.queryByText('Webentwicklung.')).toBeNull()
    expect(screen.queryByText('Welche Leistungen bietet Niklas?')).toBeNull()
  })
  it('declines without a provider request and leaves the rest of the site available', () => {
    render(React.createElement(AIChat, { initiallyOpen: true }))
    fireEvent.click(screen.getByRole('button', { name: 'Ohne KI-Chat fortfahren' }))
    expect(screen.queryByRole('region')).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'KI-Chat öffnen' }))
    expect(screen.getByRole('button', { name: 'Einwilligen und Chat nutzen' })).toBeTruthy()
  })
  it('withdraws during a request, clears local data and does not restore an aborted question', async () => {
    vi.mocked(fetch).mockImplementation(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => reject(new Error('Aborted')), {
            once: true,
          })
        }),
    )
    render(React.createElement(AIChat, { initiallyOpen: true }))
    confirm()
    send('Meine private Frage')
    fireEvent.click(screen.getByRole('button', { name: 'Einwilligung widerrufen' }))
    await waitFor(() =>
      expect(
        (screen.getByRole('button', { name: 'Nachricht senden' }) as HTMLButtonElement).disabled,
      ).toBe(true),
    )
    expect(sessionStorage.getItem('easycode-ai-chat-consent')).toBeNull()
    expect((vi.mocked(fetch).mock.calls[0][1]?.signal as AbortSignal).aborted).toBe(true)
    expect(screen.queryByText('Meine private Frage')).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
    await waitFor(() =>
      expect(
        (
          screen.getByRole('textbox', {
            name: 'Deine Nachricht an den KI-Assistenten',
          }) as HTMLInputElement
        ).value,
      ).toBe(''),
    )
    send()
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it('requires fresh consent after 24 hours and keeps expired input from reaching the API', () => {
    sessionStorage.setItem(
      'easycode-ai-chat-consent',
      JSON.stringify({
        accepted: true,
        version: 'openai-consent-v2',
        acceptedAt: Date.now() - 86400000,
        id: '11111111-1111-4111-8111-111111111111',
      }),
    )
    render(React.createElement(AIChat, { initiallyOpen: true }))
    send()
    expect(fetch).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Einwilligen und Chat nutzen' })).toBeTruthy()
  })
  it('locks duplicate submission and aborts when the chat is closed', async () => {
    vi.mocked(fetch).mockImplementation(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => reject(new Error('Aborted')), {
            once: true,
          })
        }),
    )
    render(React.createElement(AIChat, { initiallyOpen: true }))
    confirm()
    send()
    fireEvent.submit(
      screen
        .getByRole('textbox', { name: 'Deine Nachricht an den KI-Assistenten' })
        .closest('form')!,
    )
    expect(fetch).toHaveBeenCalledTimes(1)
    const sending = screen.getByRole('button', { name: 'Nachricht senden' }) as HTMLButtonElement
    expect(sending.disabled).toBe(true)
    fireEvent.click(sending)
    expect(fetch).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Chatfenster schließen' }))
    fireEvent.click(screen.getByRole('button', { name: 'KI-Chat öffnen' }))
    await screen.findByText('Antwort abgebrochen. Du kannst deine Frage erneut senden.')
    expect((vi.mocked(fetch).mock.calls[0][1]?.signal as AbortSignal).aborted).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it('excludes interrupted replies from future context and displays a 429 cooldown', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{"type":"delta","text":"Partial"}\n'))
    render(React.createElement(AIChat, { initiallyOpen: true }))
    confirm()
    send()
    await screen.findByText('Die Verbindung wurde unterbrochen. Bitte versuche es erneut.')
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('{}', { status: 429, headers: { 'retry-after': '60' } }),
    )
    send()
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('Erneut senden in'),
    )
    expect(JSON.parse(vi.mocked(fetch).mock.calls[1][1]?.body as string).history).toEqual([])
    expect(
      (screen.getByRole('button', { name: 'Nachricht senden' }) as HTMLButtonElement).disabled,
    ).toBe(true)
  })
  it('does not render model images or permit arbitrary external destinations', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      stream('![tracking](https://evil.example/pixel) [Untrusted](https://evil.example/)'),
    )
    const { container } = render(React.createElement(AIChat, { initiallyOpen: true }))
    confirm()
    send()
    await screen.findByText('Untrusted')
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('Untrusted').getAttribute('href')).toBe('')
  })
})
