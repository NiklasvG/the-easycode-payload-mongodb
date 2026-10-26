'use client'

import { useEffect, useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { usePrefersReducedMotion } from '@/utilities/usePrefersReducedMotion'

export function AnimatedText({ text, className }: { text: string; className?: string }) {
  const reducedMotion = usePrefersReducedMotion()
  if (reducedMotion) return <span className={className}>{text}</span>
  return (
    <span
      className={`hero-phrase-window inline-grid max-w-full overflow-hidden align-top ${className || ''}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={text}
          initial={{ transform: 'translateY(20px)', opacity: 0 }}
          animate={{ transform: 'translateY(0)', opacity: 1 }}
          exit={{ transform: 'translateY(-20px)', opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="hero-phrase inline-block [grid-area:1/1]"
        >
          {text}
        </m.span>
      </AnimatePresence>
    </span>
  )
}

export function RotatingText({
  phrases,
  className,
  title,
}: {
  phrases: string[]
  className?: string
  title?: string | null
}) {
  const [step, setStep] = useState(0)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (phrases.length < 2 || reducedMotion) return
    const interval = window.setInterval(() => {
      if (!document.hidden) setStep((previous) => previous + 1)
    }, 3000)
    return () => window.clearInterval(interval)
  }, [phrases.length, reducedMotion])

  if (!phrases.length && !title) return null

  return (
    <div className="hero-heading">
      <h1 aria-label={[phrases[0], title].filter(Boolean).join(' ')}>
        <span
          aria-hidden="true"
          className={`inline-grid max-w-full align-top [overflow-wrap:anywhere] ${className || ''}`}
        >
          {/* Each phrase reserves its wrapped size, so CMS copy never shifts the page. */}
          {phrases.map((phrase, index) => (
            <span key={index} className="invisible [grid-area:1/1]">
              {phrase}
            </span>
          ))}
          <span className="[grid-area:1/1]">
            <AnimatedText text={phrases[reducedMotion ? 0 : step % phrases.length] || ''} />
          </span>
        </span>
        <span className="block relative z-10 [overflow-wrap:anywhere]">{title}</span>
      </h1>
    </div>
  )
}
