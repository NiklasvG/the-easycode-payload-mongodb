'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
	COOKIE_CONSENT_KEY,
	ConsentSettings,
	getConsent,
	dispatchConsentUpdate
} from '@/utilities/cookieConsent'

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
			updateGtagConsent(stored)
		}

		// Event-Listener zum manuellen Öffnen des Banners (z. B. aus dem Footer)
		const handleOpenBanner = () => {
			setIsOpen(true)
			setShowDetails(true) // Direkt in die Einstellungen springen, wenn manuell geöffnet
		}

		window.addEventListener('show-cookie-banner', handleOpenBanner)
		return () =>
			window.removeEventListener('show-cookie-banner', handleOpenBanner)
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
	}

	const handleAcceptAll = () => {
		const allSettings = { necessary: true, analytics: true, marketing: true }
		saveSettings(allSettings)
	}

	const handleAcceptSelected = () => {
		saveSettings(settings)
	}

	const handleDeclineAll = () => {
		const declinedSettings = {
			necessary: true,
			analytics: false,
			marketing: false
		}
		saveSettings(declinedSettings)
	}

	const saveSettings = (newSettings: ConsentSettings) => {
		const settingsWithTimestamp = {
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
	}

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ y: 100, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: 100, opacity: 0 }}
					className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-8 md:bottom-8 md:max-w-md"
				>
					<div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl p-6 overflow-hidden relative">
						<div className="flex items-start gap-4 mb-6">
							<div className="p-3 bg-accent/10 rounded-xl text-accent ring-1 ring-accent/20">
								<Cookie size={28} />
							</div>
							<div>
								<h3 className="text-xl font-bold font-sans tracking-tight">
									Cookie-Einstellungen
								</h3>
								<p className="text-sm text-muted-foreground mt-1 leading-relaxed">
									Wir verwenden Cookies, um die grundlegenden Funktionen der
									Website sicherzustellen sowie zur Analyse der Nutzung (Google
									Analytics). Weitere Informationen und Details finden Sie in
									unserer{' '}
									<a
										href="/privacy"
										className="text-accent underline hover:no-underline"
									>
										Datenschutzerklärung
									</a>
									.
								</p>
							</div>
						</div>

						{!showDetails ? (
							<div className="flex flex-col gap-3">
								<Button
									className="w-full text-base font-semibold py-6"
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
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: 'auto', opacity: 1 }}
								className="space-y-5"
							>
								<div className="space-y-3 pt-2">
									{/* Necessary */}
									<div className="flex items-start justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
										<div className="flex flex-col pr-4">
											<div className="flex items-center gap-2">
												<ShieldCheck size={14} className="text-accent" />
												<span className="text-sm font-bold text-foreground">
													Notwendig
												</span>
											</div>
											<span className="text-xs text-muted-foreground mt-1">
												Ermöglichen Grundfunktionen wie Sicherheit und
												Navigation.
											</span>
										</div>
										<Checkbox checked disabled />
									</div>

									{/* Analytics */}
									<div
										className="flex items-start justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 transition-colors hover:bg-secondary/50 cursor-pointer"
										onClick={() =>
											setSettings((s) => ({ ...s, analytics: !s.analytics }))
										}
									>
										<div className="flex flex-col pr-4">
											<span className="text-sm font-bold text-foreground">
												Analytische Cookies
											</span>
											<span className="text-xs text-muted-foreground mt-1">
												Analytische Cookies (Google Analytics) helfen uns zu
												verstehen, wie Besucher unsere Website nutzen. Dabei
												werden Daten anonymisiert verarbeitet und können in die
												USA übertragen werden.
											</span>
										</div>
										<Checkbox
											checked={settings.analytics}
											onCheckedChange={(checked) =>
												setSettings((s) => ({ ...s, analytics: !!checked }))
											}
											onClick={(e) => e.stopPropagation()} // Prevent double toggle
										/>
									</div>

									{/* Marketing */}
									<div
										className="flex items-start justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 transition-colors hover:bg-secondary/50 cursor-pointer"
										onClick={() =>
											setSettings((s) => ({ ...s, marketing: !s.marketing }))
										}
									>
										<div className="flex flex-col pr-4">
											<span className="text-sm font-bold text-foreground">
												Marketing
											</span>
											<span className="text-xs text-muted-foreground mt-1">
												Werden verwendet, um personalisierte Erlebnisse und
												relevante Inhalte bereitzustellen.
											</span>
										</div>
										<Checkbox
											checked={settings.marketing}
											onCheckedChange={(checked) =>
												setSettings((s) => ({ ...s, marketing: !!checked }))
											}
											onClick={(e) => e.stopPropagation()} // Prevent double toggle
										/>
									</div>
								</div>

								<div className="flex flex-col gap-2 pt-2">
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

						<div className="mt-6 pt-4 border-t border-border flex justify-center gap-4">
							<a
								href="/privacy"
								className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-accent transition-colors"
							>
								Datenschutz
							</a>
							<a
								href="/impressum"
								className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-accent transition-colors"
							>
								Impressum
							</a>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
