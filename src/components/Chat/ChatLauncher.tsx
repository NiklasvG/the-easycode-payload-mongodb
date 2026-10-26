'use client'

import dynamic from 'next/dynamic'
import { MessageSquare, X } from 'lucide-react'
import { useId, useRef, useState, type Ref } from 'react'
import Link from 'next/link'

const DeferredChat = dynamic(() => import('./AIChat').then((module) => module.AIChat), {
  ssr: false,
  loading: () => <LauncherButton loading />,
})

function LauncherButton({
  onClick,
  loading = false,
  expanded = false,
  controls,
  buttonRef,
}: {
  onClick?: () => void
  loading?: boolean
  expanded?: boolean
  controls?: string
  buttonRef?: Ref<HTMLButtonElement>
}) {
  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 flex flex-col items-end">
      <button
        type="button"
        ref={buttonRef}
        onClick={onClick}
        disabled={loading}
        aria-busy={loading}
        aria-label={
          loading
            ? 'KI-Chat wird geladen'
            : expanded
              ? 'Hinweis zum KI-Chat schließen'
              : 'KI-Chat öffnen'
        }
        aria-expanded={expanded}
        aria-controls={controls}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-accent-contrast hover:bg-accent-contrast/90 text-white shadow-lg shadow-accent/20 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <MessageSquare className="w-6 h-6" aria-hidden="true" />
      </button>
    </div>
  )
}

export function ChatLauncher() {
  const noticeId = useId()
  const launcherRef = useRef<HTMLButtonElement>(null)
  const [activated, setActivated] = useState(false)
  const [checking, setChecking] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const closeNotice = () => {
    setUnavailable(false)
    launcherRef.current?.focus({ preventScroll: true })
  }
  const open = async () => {
    if (checking) return
    setChecking(true)
    try {
      const response = await fetch('/api/ai-chat', {
        cache: 'no-store',
        credentials: 'omit',
        signal: AbortSignal.timeout(5000),
      })
      const status = await response.json()
      if (response.ok && status.available === true) setActivated(true)
      else setUnavailable(true)
    } catch {
      setUnavailable(true)
    } finally {
      setChecking(false)
    }
  }
  return activated ? (
    <DeferredChat initiallyOpen />
  ) : (
    <div
      onKeyDown={(event) => {
        if (unavailable && event.key === 'Escape') {
          event.stopPropagation()
          closeNotice()
        }
      }}
    >
      <LauncherButton
        buttonRef={launcherRef}
        expanded={unavailable}
        controls={unavailable ? noticeId : undefined}
        onClick={() => {
          if (unavailable) closeNotice()
          else void open()
        }}
        loading={checking}
      />
      {unavailable && (
        <div
          id={noticeId}
          role="status"
          className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-white/20 bg-card p-6 text-foreground shadow-2xl [overflow-wrap:anywhere]"
        >
          <button
            type="button"
            aria-label="Hinweis schließen"
            onClick={closeNotice}
            className="absolute -top-5 right-3 flex size-11 items-center justify-center rounded-full border border-white/20 bg-card text-muted-foreground shadow-lg transition-colors duration-150 hover:bg-secondary-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
          <div className="mb-4 flex items-center gap-3 pr-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20">
              <MessageSquare className="size-5" aria-hidden="true" />
            </span>
            <h2 className="text-base font-semibold">Direkter Kontakt</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Der KI-Chat ist momentan nicht verfügbar. Du erreichst mich per{' '}
            <Link
              href="mailto:info@the-easycode.eu"
              className="font-medium text-accent underline underline-offset-4"
            >
              E-Mail
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  )
}
