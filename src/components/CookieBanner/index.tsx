'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
	COOKIE_CONSENT_KEY,
	ConsentSettings,
	getConsent,
	dispatchConsentUpdate,
	clearGoogleAnalyticsCookies,
	setGoogleAnalyticsDisable
} from '@/utilities/cookieConsent'
import { GA_MEASUREMENT_ID } from '@/components/GoogleAnalytics'

export const CookieBanner = () => {
	const [isOpen, setIsOpen] = useState(false)
	const [showDetails, setShowDetails] = useState(false)
	const [settings, setSettings] = useState<ConsentSettings>({
		necessary: true,
		analytics: false,
		marketing: false
	})

	useEffect(() => {
		const stored = getConsent()

		if (!stored) {
			setIsOpen(true)
		} else {
			setSettings(stored)
			updateGtagConsent(stored)
		}

		const handleOpenBanner = () => {
			const latestConsent = getConsent()

			if (latestConsent) {
				setSettings(latestConsent)
			}

			setIsOpen(true)
			setShowDetails(true)
		}

		window.addEventListener('show-cookie-banner', handleOpenBanner)

		return () => {
			window.removeEventListener('show-cookie-banner', handleOpenBanner)
		}
	}, [])

	const updateGtagConsent = (consent: ConsentSettings) => {
		if (typeof window !== 'undefined' && window.gtag) {
			window.gtag('consent', 'update', {
				ad_storage: consent.marketing ? 'granted' : 'denied',
				ad_user_data: consent.marketing ? 'granted' : 'denied',
				ad_personalization: consent.marketing ? 'granted' : 'denied',
				analytics_storage: consent.analytics ? 'granted' : 'denied'
			})
		}

		setGoogleAnalyticsDisable(GA_MEASUREMENT_ID, !consent.analytics)

		if (!consent.analytics) {
			clearGoogleAnalyticsCookies(GA_MEASUREMENT_ID)
		}
	}

	const saveSettings = (newSettings: ConsentSettings) => {
		const settingsWithTimestamp: ConsentSettings = {
			...newSettings,
			timestamp: Date.now()
		}

		setSettings(settingsWithTimestamp)
		localStorage.setItem(
			COOKIE_CONSENT_KEY,
			JSON.stringify(settingsWithTimestamp)
		)

		updateGtagConsent(settingsWithTimestamp)
		dispatchConsentUpdate()
		setIsOpen(false)
		setShowDetails(false)
	}

	const handleAcceptAll = () => {
		saveSettings({
			necessary: true,
			analytics: true,
			marketing: true
		})
	}

	const handleAcceptSelected = () => {
		saveSettings(settings)
	}

	const handleDeclineAll = () => {
		saveSettings({
			necessary: true,
			analytics: false,
			marketing: false
		})
	}

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ y: 100, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: 100, opacity: 0 }}
					className="fixed inset-x-4 bottom-4 z-[100] md:left-auto md:right-8 md:bottom-8 md:max-w-md"
				>
					<div className="relative flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card/95 p-6 shadow-2xl backdrop-blur-md">
						<div className="mb-2 sm:mb-6 flex shrink-0 flex-col items-center gap-4 sm:flex-row sm:items-start">
							<div className="rounded-xl bg-accent/10 p-2 text-accent ring-1 ring-accent/20 sm:p-3">
								<Cookie className="size-5 sm:size-7" />
							</div>

							<div>
								<h3 className="font-sans text-xl font-bold tracking-tight">
									Cookie-Einstellungen
								</h3>
								<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
									Wir verwenden Cookies, um die grundlegenden Funktionen der
									Website sicherzustellen sowie zur Analyse der Nutzung. Weitere
									Informationen befinden sich in unserer{' '}
									<Link
										href="/datenschutz"
										className="text-accent underline hover:no-underline"
									>
										Datenschutzerklärung
									</Link>
									.
								</p>
							</div>
						</div>

						{!showDetails ? (
							<div className="flex shrink-0 flex-col gap-3">
								<Button
									className="w-full py-6 text-base font-semibold"
									onClick={handleAcceptAll}
								>
									Alle akzeptieren
								</Button>

								<div className="flex gap-3">
									<Button
										variant="outline"
										className="flex-1 py-5"
										onClick={() => setShowDetails(true)}
									>
										Einstellungen
									</Button>

									<Button
										variant="secondary"
										className="flex-1 py-5"
										onClick={handleDeclineAll}
									>
										Alle ablehnen
									</Button>
								</div>
							</div>
						) : (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="flex min-h-0 flex-1 flex-col"
							>
								<div className="min-h-0 flex-1 overflow-y-auto pr-1">
									<div className="space-y-3 pt-2">
										<div className="flex items-start justify-between rounded-xl border border-border/50 bg-secondary/30 p-4">
											<div className="flex flex-col pr-4">
												<div className="flex items-center gap-2">
													<ShieldCheck size={14} className="text-accent" />
													<span className="text-sm font-bold text-foreground">
														Notwendig
													</span>
												</div>
												<span className="mt-1 text-xs text-muted-foreground">
													Ermöglichen Grundfunktionen wie Sicherheit und
													Navigation.
												</span>
											</div>

											<Checkbox checked disabled />
										</div>

										<div
											className="flex cursor-pointer items-start justify-between rounded-xl border border-border/50 bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
											onClick={() =>
												setSettings((s) => ({
													...s,
													analytics: !s.analytics
												}))
											}
										>
											<div className="flex flex-col pr-4">
												<span className="text-sm font-bold text-foreground">
													Analytische Cookies
												</span>
												<span className="mt-1 text-xs text-muted-foreground">
													Analytische Cookies (Google Analytics) helfen uns zu
													verstehen, wie Besucher unsere Website nutzen. Dabei
													werden Daten anonymisiert verarbeitet und können in
													die USA übertragen werden.
												</span>
											</div>

											<Checkbox
												checked={settings.analytics}
												onCheckedChange={(checked) =>
													setSettings((s) => ({
														...s,
														analytics: !!checked
													}))
												}
												onClick={(e) => e.stopPropagation()}
											/>
										</div>

										<div
											className="flex cursor-pointer items-start justify-between rounded-xl border border-border/50 bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
											onClick={() =>
												setSettings((s) => ({
													...s,
													marketing: !s.marketing
												}))
											}
										>
											<div className="flex flex-col pr-4">
												<span className="text-sm font-bold text-foreground">
													Marketing
												</span>
												<span className="mt-1 text-xs text-muted-foreground">
													Werden verwendet, um personalisierte Erlebnisse und
													relevante Inhalte bereitzustellen.
												</span>
											</div>

											<Checkbox
												checked={settings.marketing}
												onCheckedChange={(checked) =>
													setSettings((s) => ({
														...s,
														marketing: !!checked
													}))
												}
												onClick={(e) => e.stopPropagation()}
											/>
										</div>
									</div>
								</div>

								<div className="mt-4 flex shrink-0 flex-col gap-2 border-t border-border/50 pt-4">
									<Button
										className="w-full font-bold"
										onClick={handleAcceptSelected}
									>
										Auswahl bestätigen
									</Button>

									<Button
										variant="ghost"
										size="sm"
										className="text-muted-foreground hover:text-foreground"
										onClick={() => setShowDetails(false)}
									>
										Abbrechen & Zurück
									</Button>
								</div>
							</motion.div>
						)}

						<div className="mt-6 flex shrink-0 justify-center gap-4 border-t border-border pt-4">
							<Link
								href="/datenschutz"
								className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent"
							>
								Datenschutz
							</Link>
							<Link
								href="/impressum"
								className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent"
							>
								Impressum
							</Link>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
