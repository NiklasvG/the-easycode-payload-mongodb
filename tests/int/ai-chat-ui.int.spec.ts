import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
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
  fireEvent.click(screen.getByRole('button', { name: 'Hinweis gelesen – Chat nutzen' }))
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
  localStorage.clear()
  sessionStorage.clear()
})

describe('AI chat privacy and interaction', () => {
  it('requires the new provider notice even if the old disclaimer was confirmed', async () => {
    localStorage.setItem('easycode-ai-chat-disclaimer-confirmed', 'true')
    render(React.createElement(AIChat, { initiallyOpen: true }))
    send()
    expect(fetch).not.toHaveBeenCalled()
    confirm()
    expect(localStorage.getItem('easycode-ai-chat-disclaimer-confirmed')).toBe('openai-v1')
    send()
    await screen.findByText('Webentwicklung.')
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string)
    expect(body.noticeVersion).toBe('openai-v1')
    expect(body.history).toEqual([])
    expect(localStorage.getItem('easycode-ai-chat-disclaimer-confirmed')).not.toContain(
      'Webentwicklung',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Verlauf löschen' }))
    expect(screen.queryByText('Webentwicklung.')).toBeNull()
    expect(screen.queryByText('Welche Leistungen bietet Niklas?')).toBeNull()
  })
  it('locks duplicate submission synchronously and aborts when stopped', async () => {
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
    fireEvent.click(screen.getByRole('button', { name: 'Antwort stoppen' }))
    await screen.findByText('Antwort abgebrochen. Du kannst deine Frage erneut senden.')
    expect((vi.mocked(fetch).mock.calls[0][1]?.signal as AbortSignal).aborted).toBe(true)
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
