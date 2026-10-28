'use client'

import { Sparkles } from 'lucide-react'
import React, { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import type { Media } from '@/payload-types'

const hint = 'Dieses Bild wurde mit KI generiert oder angepasst.'

export function AIImageBadge({
  resource,
  compact = false,
}: {
  resource?: Pick<Media, 'isAIGenerated'> | string | number | null
  compact?: boolean
}) {
  const tooltipId = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState<{ left: number; top: number; above: boolean } | null>(
    null,
  )
  const open = position !== null

  useEffect(() => {
    if (!open) return
    const hide = () => setPosition(null)
    window.addEventListener('scroll', hide, true)
    window.addEventListener('resize', hide)
    return () => {
      window.removeEventListener('scroll', hide, true)
      window.removeEventListener('resize', hide)
    }
  }, [open])

  if (!resource || typeof resource !== 'object' || !resource.isAIGenerated) return null

  const show = () => {
    const rect = trigger.current?.getBoundingClientRect()
    if (!rect) return
    setPosition({
      left: Math.max(8, Math.min(rect.right - 256, window.innerWidth - 264)),
      top: rect.top >= 88 ? rect.top - 8 : rect.bottom + 8,
      above: rect.top >= 88,
    })
  }

  return (
    <span className={`ai-image-badge${compact ? ' ai-image-badge--compact' : ''}`}>
      <button
        ref={trigger}
        type="button"
        className="image-teaser__hint-trigger"
        aria-label="KI: Hinweis zur Bildbearbeitung anzeigen"
        aria-describedby={position ? tooltipId : undefined}
        onMouseEnter={show}
        onMouseLeave={() => {
          if (document.activeElement !== trigger.current) setPosition(null)
        }}
        onFocus={show}
        onBlur={() => setPosition(null)}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          show()
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            setPosition(null)
          }
        }}
      >
        <Sparkles className="size-4" aria-hidden="true" />
        {!compact && <span>KI</span>}
      </button>
      {position &&
        createPortal(
          <span
            id={tooltipId}
            role="tooltip"
            className="ai-image-tooltip"
            style={{
              left: position.left,
              top: position.top,
              transform: position.above ? 'translateY(-100%)' : undefined,
            }}
          >
            {hint}
          </span>,
          document.body,
        )}
    </span>
  )
}
