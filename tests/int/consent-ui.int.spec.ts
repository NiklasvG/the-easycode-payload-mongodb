import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CookieBanner } from '@/components/CookieBanner'
import { COOKIE_CONSENT_KEY } from '@/utilities/cookieConsent'

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: React.PropsWithChildren) => children,
  motion: {
    div: ({
      initial: _i,
      animate: _a,
      exit: _e,
      transition: _t,
      ...props
    }: React.ComponentProps<'div'> & Record<string, unknown>) => React.createElement('div', props),
  },
}))
vi.mock('next/link', () => ({
  default: ({ children, ...props }: React.ComponentProps<'a'>) =>
    React.createElement('a', props, children),
}))
describe('consent UI external storage', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    localStorage.clear()
  })
  it('accepts and allows later revocation', () => {
    render(React.createElement(CookieBanner))
    fireEvent.click(screen.getByRole('button', { name: 'Alle akzeptieren' }))
    expect(JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY)!).analytics).toBe(true)
    act(() => window.dispatchEvent(new Event('show-cookie-banner')))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Nutzungsanalyse' }))
    fireEvent.click(screen.getByRole('button', { name: 'Auswahl bestätigen' }))
    expect(JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY)!).analytics).toBe(false)
  })
  it('closes without throwing when storage writes are denied', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Denied')
    })
    render(React.createElement(CookieBanner))
    fireEvent.click(screen.getByRole('button', { name: 'Alle ablehnen' }))
    expect(screen.queryByRole('button', { name: 'Alle ablehnen' })).toBeNull()
    expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBeNull()
  })
})
