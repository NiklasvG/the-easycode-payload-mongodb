'use client'

import React, { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FolderSettingsIcon } from './FolderSettingsIcon'
import {
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_EVENT,
  ConsentSettings,
  getConsent,
  dispatchConsentUpdate,
} from '@/utilities/cookieConsent'

const subscribeConsent = (callback: () => void) => {
  window.addEventListener(COOKIE_CONSENT_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(COOKIE_CONSENT_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}
const consentSnapshot = () => JSON.stringify(getConsent())

export const CookieBanner = () => {
  const analyticsID = useId()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const [manuallyOpen, setIsOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const snapshot = useSyncExternalStore(subscribeConsent, consentSnapshot, () => undefined)
  const stored = snapshot ? (JSON.parse(snapshot) as ConsentSettings | null) : null
  const isOpen = manuallyOpen || (snapshot !== undefined && !stored && !dismissed)
  const [showDetails, setShowDetails] = useState(false)
  const [editedSettings, setSettings] = useState<ConsentSettings | null>(null)
  const settings = editedSettings ?? stored ?? { necessary: true, analytics: false }

  useEffect(() => {
    const handleOpenBanner = () => {
      returnFocus.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
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

  useEffect(() => {
    if (manuallyOpen) headingRef.current?.focus({ preventScroll: true })
  }, [manuallyOpen])

  const saveSettings = (newSettings: ConsentSettings) => {
    const settingsWithTimestamp: ConsentSettings = {
      ...newSettings,
      timestamp: Date.now(),
    }

    setSettings(settingsWithTimestamp)
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(settingsWithTimestamp))
    } catch {
      /* Tracking remains disabled without stored consent. */
    }

    dispatchConsentUpdate()
    setIsOpen(false)
    setDismissed(true)
    setShowDetails(false)
    returnFocus.current?.focus({ preventScroll: true })
  }

  const handleAcceptAll = () => {
    saveSettings({
      necessary: true,
      analytics: true,
    })
  }

  const handleAcceptSelected = () => {
    saveSettings(settings)
  }

  const handleDeclineAll = () => {
    saveSettings({
      necessary: true,
      analytics: false,
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          role="region"
          aria-label="Cookie-Einstellungen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-100 md:left-auto md:right-8 md:bottom-8 md:max-w-md"
        >
          <div className="relative flex max-h-[calc(100dvh-2rem-env(safe-area-inset-bottom))] flex-col overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-card p-5 text-card-foreground sm:p-6 [overflow-wrap:anywhere]">
            <div className="mb-5 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <h3
                  ref={headingRef}
                  tabIndex={-1}
                  className="font-sans text-lg font-bold tracking-tight text-accent outline-hidden"
                >
                  Cookie-Einstellungen
                </h3>
                <FolderSettingsIcon />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Wir verwenden Cookies, um die grundlegenden Funktionen der Website sicherzustellen.
                Mit deiner Zustimmung analysieren wir die Nutzung und Ladezeiten mit Umami ohne
                Analyse-Cookies. Weitere Informationen findest du in unserer{' '}
                <Link href="/datenschutz" className="inline-link">
                  Datenschutzerklärung
                </Link>
                .
              </p>
            </div>

            {!showDetails ? (
              <div className="flex shrink-0 flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    className="rounded-full! border! border-muted-foreground! bg-transparent px-4! py-3! text-sm! font-medium text-foreground hover:border-foreground! hover:bg-secondary"
                    onClick={handleAcceptAll}
                  >
                    Alle akzeptieren
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-full! border! border-muted-foreground! bg-transparent px-4! py-3! text-sm! font-medium text-foreground hover:border-foreground! hover:bg-secondary"
                    onClick={handleDeclineAll}
                  >
                    Alle ablehnen
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  className="w-full rounded-full! px-3! py-2! text-sm! text-muted-foreground hover:text-foreground"
                  onClick={() => setShowDetails(true)}
                >
                  Einstellungen
                </Button>
              </div>
            ) : (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex shrink-0 flex-col"
              >
                <div className="divide-y divide-white/10 border-y border-white/10">
                  <div className="flex items-start justify-between gap-4 py-4">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">Notwendig</span>
                      </div>
                      <span className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Ermöglichen Grundfunktionen wie Sicherheit und Navigation.
                      </span>
                    </div>

                    <Checkbox
                      className="mt-1 shrink-0"
                      aria-label="Notwendige Funktionen, immer aktiv"
                      checked
                      disabled
                    />
                  </div>

                  <label
                    htmlFor={analyticsID}
                    className="flex cursor-pointer items-start justify-between gap-4 py-4"
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          Nutzungsanalyse
                        </span>
                      </span>
                      <span className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Umami hilft uns zu verstehen, wie du unsere Website nutzt und wie schnell
                        sie lädt. Die Analyse läuft auf unserer eigenen Infrastruktur und verwendet
                        keine Analyse-Cookies.
                      </span>
                    </span>

                    <Checkbox
                      id={analyticsID}
                      className="mt-1 shrink-0"
                      aria-label="Nutzungsanalyse"
                      checked={settings.analytics}
                      onCheckedChange={(checked) =>
                        setSettings((s) => ({
                          ...(s ?? settings),
                          analytics: !!checked,
                        }))
                      }
                    />
                  </label>
                </div>

                <div className="mt-4 flex shrink-0 flex-col gap-2">
                  <Button
                    variant="ghost"
                    className="w-full rounded-full! border! border-muted-foreground! bg-transparent px-4! py-3! text-sm! font-medium text-foreground hover:border-foreground! hover:bg-secondary"
                    onClick={handleAcceptSelected}
                  >
                    Auswahl bestätigen
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full! px-3! py-2! text-sm! text-muted-foreground hover:text-foreground"
                    onClick={() => setShowDetails(false)}
                  >
                    Abbrechen & Zurück
                  </Button>
                </div>
              </m.div>
            )}

            <div className="mt-3 flex shrink-0 gap-5 border-t border-white/10 pt-2">
              <Link
                href="/datenschutz"
                className="inline-link inline-flex min-h-11 items-center text-sm"
              >
                Datenschutz
              </Link>
              <Link
                href="/impressum"
                className="inline-link inline-flex min-h-11 items-center text-sm"
              >
                Impressum
              </Link>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
