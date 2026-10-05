'use client'

import { useRef } from 'react'
import type { ReactNode } from 'react'
import { m, useScroll, useTransform } from 'framer-motion'
import { usePrefersReducedMotion } from '@/utilities/usePrefersReducedMotion'

export function HeroIcons({ children }: { children: ReactNode }) {
  const heroRef = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const iconOffset = useTransform(scrollYProgress, [0, 1], [0, 60])

  return (
    <m.div
      ref={(element) => { heroRef.current = element?.closest('section') ?? null }}
      style={{ y: reducedMotion ? 0 : iconOffset }}
      initial={reducedMotion ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.5 }}
      className="hero-icons absolute inset-0 pointer-events-none"
    >
      {children}
    </m.div>
  )
}
