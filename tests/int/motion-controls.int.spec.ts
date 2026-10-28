import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { RotatingText } from '@/components/shared/Animation/AnimatedText'
import { CopyButton } from '@/blocks/Code/CopyButton'

// Transitions are visually checked in the browser; these tests cover content and controls.
vi.mock('framer-motion', () => ({
  m: {
    span: ({ children, className }: React.ComponentProps<'span'>) =>
      React.createElement('span', { className }, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

beforeEach(() => {
  vi.useFakeTimers()
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi
      .fn()
      .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

it('keeps a stable accessible heading while rotating text without controls', () => {
  const { container } = render(
    React.createElement(RotatingText, {
      phrases: ['Webentwicklung', 'Individuelle Anwendungen für Ihr Unternehmen'],
      title: 'aus Dresden',
    }),
  )
  const heading = container.querySelector('h1')!
  expect(screen.getByRole('heading', { level: 1, name: 'Webentwicklung aus Dresden' })).toBeTruthy()
  expect(heading.querySelector('div')).toBeNull()
  expect(heading.querySelector('button')).toBeNull()
  const accessibleContent = heading.getAttribute('aria-label')
  expect(container.querySelector('button')).toBeNull()
  const visual = heading.querySelector('.hero-phrase')!
  const firstContent = visual.textContent
  act(() => vi.advanceTimersByTime(3000))
  expect(heading.querySelector('.hero-phrase')!.textContent).not.toBe(firstContent)
  expect(heading.getAttribute('aria-label')).toBe(accessibleContent)
  expect(screen.getByRole('heading', { level: 1, name: 'Webentwicklung aus Dresden' })).toBeTruthy()
})

it('renders an empty CMS phrase list without a timer or control', () => {
  const { container } = render(React.createElement(RotatingText, { phrases: [] }))
  expect(container.innerHTML).toBe('')
  expect(vi.getTimerCount()).toBe(0)
})

it('announces clipboard failure instead of leaving a rejected copy action unhandled', async () => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockRejectedValue(new Error('Permission denied')) },
  })
  render(React.createElement(CopyButton, { code: 'const test = true' }))
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Code kopieren' })))
  expect(screen.getByRole('status').textContent).toContain('manuell kopieren')
  expect(screen.getByRole('button', { name: 'Code kopieren' })).toBeTruthy()
})

it('announces a successful copy and releases its feedback timer on unmount', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  const { unmount } = render(React.createElement(CopyButton, { code: 'const test = true' }))
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Code kopieren' })))
  expect(writeText).toHaveBeenCalledWith('const test = true')
  expect(screen.getByRole('status').textContent).toBe('Code kopiert.')
  unmount()
  expect(vi.getTimerCount()).toBe(0)
})
