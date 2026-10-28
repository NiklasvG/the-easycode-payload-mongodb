'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

import { COOKIE_CONSENT_EVENT, getConsent } from '@/utilities/cookieConsent'

type Props = {
  scriptUrl?: string
  websiteId?: string
}

declare global {
  interface Window {
    umamiBeforeSend?: (type: string, payload: Record<string, unknown>) => Record<string, unknown> | false
  }
}

export const UmamiAnalytics = ({ scriptUrl, websiteId }: Props) => {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    let active = true

    // Removing a script does not stop its existing navigation/performance listeners.
    // Check current consent for every send, including after consent is revoked.
    window.umamiBeforeSend = (_type, payload) => {
      if (!active || !getConsent()?.analytics) return false
      return payload
    }

    const updateConsent = () => setHasConsent(getConsent()?.analytics === true)
    updateConsent()
    window.addEventListener(COOKIE_CONSENT_EVENT, updateConsent)
    window.addEventListener('storage', updateConsent)

    return () => {
      active = false
      window.removeEventListener(COOKIE_CONSENT_EVENT, updateConsent)
      window.removeEventListener('storage', updateConsent)
    }
  }, [])

  if (!scriptUrl || !websiteId || !hasConsent) return null

  return (
    <Script
      id="umami-analytics"
      src={scriptUrl}
      strategy="afterInteractive"
      data-website-id={websiteId}
      data-before-send="umamiBeforeSend"
      data-exclude-search="true"
      data-exclude-hash="true"
      data-do-not-track="true"
      data-performance="true"
    />
  )
}
