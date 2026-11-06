'use client'

import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/utilities/usePrefersReducedMotion'

// Local assets and a lazy player keep consent UI independent of third-party requests.
export function FolderSettingsIcon() {
  const containerRef = useRef<HTMLSpanElement>(null)
  const fallbackRef = useRef<HTMLSpanElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const container = containerRef.current
    const fallback = fallbackRef.current
    if (!container || !fallback || reducedMotion) return

    let disposed = false
    let element: HTMLElement | undefined
    let cleanup = () => {}

    void import('@lordicon/element')
      .then(({ defineElement }) => {
        if (disposed) return
        if (!customElements.get('lord-icon')) defineElement()
        const icon = document.createElement('lord-icon')
        element = icon
        icon.setAttribute('src', '/icons/lordicon/folder-settings.json')
        icon.setAttribute('state', 'in-reveal')
        icon.style.setProperty('--lord-icon-primary', '#fff')
        icon.style.setProperty('--lord-icon-secondary', 'oklch(var(--accent))')
        icon.style.width = '100%'
        icon.style.height = '100%'
        icon.style.opacity = '0'
        const ready = () => {
          if (disposed) return
          icon.style.opacity = '1'
          fallback.style.visibility = 'hidden'
        }
        icon.addEventListener('ready', ready)
        // The built-in entrance trigger plays once; there is no hover or loop trigger.
        icon.setAttribute('trigger', 'in')
        container.append(icon)
        cleanup = () => icon.removeEventListener('ready', ready)
      })
      .catch(() => {
        // The local static silhouette remains visible if the player cannot load.
      })

    return () => {
      disposed = true
      cleanup()
      element?.remove()
      fallback.style.visibility = 'visible'
    }
  }, [reducedMotion])

  return (
    <span className="relative block size-10 shrink-0 text-foreground" aria-hidden="true">
      <span
        ref={fallbackRef}
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/icons/lordicon/folder-settings.svg)',
        }}
      />
      <span ref={containerRef} className="absolute inset-0" />
    </span>
  )
}
