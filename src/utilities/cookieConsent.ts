'use client'

export const COOKIE_CONSENT_KEY = 'cookie-consent-settings'

export type ConsentSettings = {
	necessary: boolean
	analytics: boolean
	timestamp?: number
}

export const getConsent = (): ConsentSettings | null => {
	if (typeof window === 'undefined') return null
	try {
		const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
		if (!stored) return null
		const parsed = JSON.parse(stored) as ConsentSettings | null
		if (!parsed || typeof parsed.analytics !== 'boolean') return null
		// Keep existing analytics choices while ignoring obsolete consent categories.
		return {
			necessary: true,
			analytics: parsed.analytics,
			timestamp: parsed.timestamp
		}
	} catch {
		return null
	}
}

export const COOKIE_CONSENT_EVENT = 'cookie-consent-updated'

export const dispatchConsentUpdate = () => {
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT))
	}
}
