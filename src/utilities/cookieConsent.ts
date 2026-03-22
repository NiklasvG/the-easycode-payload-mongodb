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

export const deleteCookie = (name: string, path = '/') => {
	if (typeof document === 'undefined') return
	document.cookie = `${name}=; Max-Age=0; path=${path}; SameSite=Lax`
	document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax`
}

export const clearGoogleAnalyticsCookies = (measurementId: string) => {
	deleteCookie('_ga')
	deleteCookie(`_ga_${measurementId.replace('G-', '')}`)
	deleteCookie('_gid')
	deleteCookie('_gat')
}

export const setGoogleAnalyticsDisable = (
	measurementId: string,
	disabled: boolean
) => {
	if (typeof window !== 'undefined') {
		;(window as any)[`ga-disable-${measurementId}`] = disabled
	}
}
