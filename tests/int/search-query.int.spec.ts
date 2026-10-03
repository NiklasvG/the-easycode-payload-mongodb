import React from 'react'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ query: 'Testprojekt', replace: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mocks.replace }), useSearchParams: () => new URLSearchParams({ q: mocks.query }) }))
import { Search } from '@/search/Component'
beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); mocks.query = 'Testprojekt' })
afterEach(() => { cleanup(); vi.useRealTimers() })
it('keeps a supplied query and encodes edited queries without extra URL parameters', () => {
  const view = render(React.createElement(Search))
  const input = view.getByRole('textbox', { name: 'Website durchsuchen' }) as HTMLInputElement
  expect(input.value).toBe('Testprojekt')
  act(() => vi.advanceTimersByTime(1000))
  expect(mocks.replace).not.toHaveBeenCalled()
  fireEvent.change(input, { target: { value: 'R&D ?' } })
  act(() => vi.advanceTimersByTime(1000))
  expect(mocks.replace).toHaveBeenLastCalledWith('/suche?q=R%26D+%3F', { scroll: false })
  mocks.query = 'Back navigation'
  view.rerender(React.createElement(Search))
  expect(input.value).toBe('Back navigation')
})
