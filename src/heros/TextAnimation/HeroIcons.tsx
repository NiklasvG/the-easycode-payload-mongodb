'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '@/utilities/usePrefersReducedMotion'

export function HeroIcons({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const element = ref.current
    const container = element?.parentElement
    if (!element || !container || reducedMotion) return

    let frame = 0
    const update = () => {
      frame = 0
      // Start once the image's lower edge is visible, including on narrow screens.
      const start = Math.max(
        0,
        container.getBoundingClientRect().bottom + window.scrollY - window.innerHeight,
      )
      const distance = Math.min(40, Math.max(0, window.scrollY - start) * 0.1)
      element.style.transform = distance ? `translateY(${-distance}px)` : ''
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    const observer = new ResizeObserver(schedule)
    observer.observe(container)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      observer.disconnect()
      element.style.transform = ''
    }
  }, [reducedMotion])

  return (
    <div ref={ref} aria-hidden="true" className="hero-icons absolute inset-0 pointer-events-none">
      {children}
    </div>
  )
}
