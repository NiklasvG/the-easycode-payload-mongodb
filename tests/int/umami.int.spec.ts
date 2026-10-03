import React from 'react'
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { UmamiAnalytics } from '@/components/UmamiAnalytics'
import { COOKIE_CONSENT_KEY, dispatchConsentUpdate } from '@/utilities/cookieConsent'

vi.mock('next/script', () => ({
  default: ({ strategy: _strategy, ...props }: React.ComponentProps<'script'> & { strategy: string }) =>
    React.createElement('script', props),
}))

const props = {
  scriptUrl: 'https://analytics.example.org/script.js',
  websiteId: 'staging-website-id',
}

const setConsent = (analytics: boolean) => {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ necessary: true, analytics, marketing: false }))
  dispatchConsentUpdate()
}

describe('Umami consent integration', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => {
    cleanup()
    localStorage.clear()
    delete window.umamiBeforeSend
    vi.restoreAllMocks()
  })

  it('does not load the tracker without consent or with missing configuration', () => {
    const { container, rerender } = render(React.createElement(UmamiAnalytics, props))
    expect(container.querySelector('script')).toBeNull()
    act(() => setConsent(true))
    rerender(React.createElement(UmamiAnalytics, { scriptUrl: props.scriptUrl }))
    expect(container.querySelector('script')).toBeNull()
  })

  it('loads configured tracking and performance only after consent', () => {
    const { container } = render(React.createElement(UmamiAnalytics, props))
    act(() => setConsent(true))
    const script = container.querySelector('script')
    expect(script?.getAttribute('src')).toBe(props.scriptUrl)
    expect(script?.getAttribute('data-website-id')).toBe(props.websiteId)
    expect(script?.getAttribute('data-performance')).toBe('true')
    expect(script?.getAttribute('data-before-send')).toBe('umamiBeforeSend')
    expect(script?.getAttribute('data-exclude-search')).toBe('true')
    const payload = { url: '/projects' }
    expect(window.umamiBeforeSend?.('event', payload)).toBe(payload)
  })

  it('blocks sends immediately after revocation and after unmount', () => {
    setConsent(true)
    const { container, unmount } = render(React.createElement(UmamiAnalytics, props))
    act(() => setConsent(false))
    expect(container.querySelector('script')).toBeNull()
    expect(window.umamiBeforeSend?.('event', {})).toBe(false)
    expect(window.umamiBeforeSend?.('performance', {})).toBe(false)
    act(() => setConsent(true))
    expect(container.querySelector('script')).not.toBeNull()
    unmount()
    expect(window.umamiBeforeSend?.('event', {})).toBe(false)
  })

  it('responds to consent changes in another tab', () => {
    setConsent(true)
    const { container } = render(React.createElement(UmamiAnalytics, props))
    act(() => {
      localStorage.removeItem(COOKIE_CONSENT_KEY)
      window.dispatchEvent(new StorageEvent('storage', { key: COOKIE_CONSENT_KEY }))
    })
    expect(container.querySelector('script')).toBeNull()
    expect(window.umamiBeforeSend?.('event', {})).toBe(false)
  })

  it('fails closed with malformed or inaccessible consent storage', () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, '{invalid')
    const { container } = render(React.createElement(UmamiAnalytics, props))
    expect(container.querySelector('script')).toBeNull()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked') })
    expect(window.umamiBeforeSend?.('event', {})).toBe(false)
  })
})
