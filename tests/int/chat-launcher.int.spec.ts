import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ChatLauncher } from '@/components/Chat/ChatLauncher'

vi.mock('next/dynamic', () => ({
  default: () => () => React.createElement('div', null, 'Chat bereit'),
}))
vi.mock('next/link', () => ({
  default: ({ children, ...props }: React.ComponentProps<'a'>) =>
    React.createElement('a', props, children),
}))
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it('keeps the input unavailable until the server confirms activation', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ available: false })))
  render(React.createElement(ChatLauncher))
  fireEvent.click(screen.getByRole('button', { name: 'KI-Chat öffnen' }))
  expect((await screen.findByRole('status')).textContent).toContain('momentan nicht verfügbar')
  expect(screen.queryByText('Chat bereit')).toBeNull()
  expect(fetch).toHaveBeenCalledWith(
    '/api/ai-chat',
    expect.objectContaining({
      cache: 'no-store',
      credentials: 'omit',
    }),
  )
})

it('opens the chat after availability is confirmed', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ available: true })))
  render(React.createElement(ChatLauncher))
  fireEvent.click(screen.getByRole('button', { name: 'KI-Chat öffnen' }))
  expect(await screen.findByText('Chat bereit')).toBeTruthy()
})
