'use client'

import { useEffect, useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { usePrefersReducedMotion } from '@/utilities/usePrefersReducedMotion'

export function AnimatedText({ text, className }: {
  text: string
  className?: string
}) {
  const reducedMotion = usePrefersReducedMotion()
  if (reducedMotion) return <span className={className}>{text}</span>
  return (
    <div className={`inline-block h-[1.2em] overflow-hidden lg:translate-y-2 ${className || ''}`}>
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={text}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-block"
        >
          {text}
        </m.span>
      </AnimatePresence>
    </div>
  )
}

export function RotatingText({ phrases, className }: { phrases: string[]; className?: string }) {
  const [step, setStep] = useState(0)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (phrases.length < 2 || reducedMotion) return
    const interval = window.setInterval(() => {
      if (!document.hidden) setStep((previous) => previous + 1)
    }, 3000)
    return () => window.clearInterval(interval)
  }, [phrases.length, reducedMotion])

  return <AnimatedText text={phrases[step % phrases.length] || ''} className={className} />
}
