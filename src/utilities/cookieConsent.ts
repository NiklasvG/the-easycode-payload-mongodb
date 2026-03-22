'use client'

export const COOKIE_CONSENT_KEY = 'cookie-consent-settings'

export type ConsentSettings = {
	necessary: boolean
	analytics: boolean
	marketing: boolean
	timestamp?: number
}

export const getConsent = (): ConsentSettings | null => {
	if (typeof window === 'undefined') return null
	const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
	if (!stored) return null
	try {
		return JSON.parse(stored) as ConsentSettings
	} catch (e) {
		return null
	}
}

export const COOKIE_CONSENT_EVENT = 'cookie-consent-updated'

export const dispatchConsentUpdate = () => {
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT))
	}
}
