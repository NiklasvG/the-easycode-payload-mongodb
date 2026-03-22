'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Suspense } from 'react'
import { getConsent, COOKIE_CONSENT_EVENT } from '@/utilities/cookieConsent'

export const GA_MEASUREMENT_ID = 'G-8BGWKK4QG5'

const GoogleAnalyticsInner = () => {
	const pathname = usePathname()
	const searchParams = useSearchParams()

	useEffect(() => {
		const url = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '')
		if (typeof window !== 'undefined' && window.gtag) {
			window.gtag('config', GA_MEASUREMENT_ID, {
				page_path: url,
				page_location: window.location.href,
				page_title: document.title
			})
		}
	}, [pathname, searchParams])

	return null
}

export const GoogleAnalytics = () => {
	const [hasConsent, setHasConsent] = useState(false)

	useEffect(() => {
		// Initial check
		const consent = getConsent()
		if (consent?.analytics) {
			setHasConsent(true)
		}

		// Listen for updates from CookieBanner
		const handleConsentUpdate = () => {
			const updatedConsent = getConsent()
			if (updatedConsent?.analytics) {
				setHasConsent(true)
			} else {
				setHasConsent(false)
				// Explicitly revoke consent if it was previously granted
				if (typeof window !== 'undefined' && window.gtag) {
					window.gtag('consent', 'update', {
						analytics_storage: 'denied',
						ad_storage: 'denied',
						ad_user_data: 'denied',
						ad_personalization: 'denied'
					})
				}
			}
		}

		window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentUpdate)
		return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentUpdate)
	}, [])

	return (
		<>
			{/* Base Gtag Setup - Always rendered to provide the gtag() stub and default denial */}
			<Script
				id="gtag-init"
				strategy="afterInteractive"
				dangerouslySetInnerHTML={{
					__html: `
                        window.dataLayer = window.dataLayer || [];
                        window.gtag = function(){ window.dataLayer.push(arguments); };
                        window.gtag('js', new Date());

                        // Default-Zustand für den Consent Mode auf 'denied' setzen
                        window.gtag('consent', 'default', {
                            'ad_storage': 'denied',
                            'ad_user_data': 'denied',
                            'ad_personalization': 'denied',
                            'analytics_storage': 'denied',
                            'wait_for_update': 500
                        });
                    `
				}}
			/>

			{hasConsent && (
				<>
					<Script
						src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
						strategy="afterInteractive"
					/>
					<Script
						dangerouslySetInnerHTML={{
							__html: `
                                window.gtag('config', '${GA_MEASUREMENT_ID}', {
                                    page_path: window.location.pathname,
                                    page_location: window.location.href,
                                    page_title: document.title
                                });
                            `
						}}
						id="google-analytics"
						strategy="afterInteractive"
					/>
					<Suspense fallback={null}>
						<GoogleAnalyticsInner />
					</Suspense>
				</>
			)}
		</>
	)
}

// Global declaration for gtag
declare global {
	interface Window {
		gtag: (...args: any[]) => void
		dataLayer: any[]
	}
}
