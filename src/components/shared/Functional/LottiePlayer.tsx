'use client'

import { useEffect, useRef } from 'react'
import { LottieSvg, type LottieHandle } from 'lottie-react'
import { usePrefersReducedMotion } from '@/utilities/usePrefersReducedMotion'

import type { LottieSvgProps } from 'lottie-react'

interface LottiePlayerProps {
  animationData: LottieSvgProps['src']
  triggerPlay: boolean
}

const LottiePlayer = ({ animationData, triggerPlay }: LottiePlayerProps) => {
  const lottieRef = useRef<LottieHandle>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playedOnce = useRef(false)
  const reducedMotion = usePrefersReducedMotion()
  const isPlaying = useRef(false)
  const visible = useRef(false)

  // Lottie SVG updates are useful only while the icon can actually be seen.
  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const syncPlayback = () => {
      if (reducedMotion || document.hidden || !visible.current) {
        lottieRef.current?.pause()
      } else if (isPlaying.current) {
        lottieRef.current?.play()
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting
      syncPlayback()
    })
    observer.observe(element)
    document.addEventListener('visibilitychange', syncPlayback)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', syncPlayback)
    }
  }, [reducedMotion])

  // Wenn von außen neu getriggert wird → Reset
  useEffect(() => {
    if (reducedMotion) lottieRef.current?.pause()
    if (triggerPlay) {
      playedOnce.current = false
    }
  }, [triggerPlay, reducedMotion])

  // Normales Verhalten: über Prop triggerPlay steuern (z. B. Hover, Scroll, etc.)
  useEffect(() => {
    if (
      triggerPlay &&
      !playedOnce.current &&
      !isPlaying.current &&
      !reducedMotion &&
      !document.hidden
    ) {
      isPlaying.current = true
      lottieRef.current?.seek({ frame: 0 })
      lottieRef.current?.play()
    }
  }, [triggerPlay, reducedMotion])

  // Zusatz: Auf mobilen Geräten einmal abspielen, wenn im Viewport
  useEffect(() => {
    if (typeof window === 'undefined') return

    const isMobile = window.matchMedia('(max-width: 767px)').matches
    if (!isMobile) return

    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            !playedOnce.current &&
            !isPlaying.current &&
            !reducedMotion &&
            !document.hidden
          ) {
            isPlaying.current = true
            lottieRef.current?.seek({ frame: 0 })
            lottieRef.current?.play()
          }
        })
      },
      {
        threshold: 1, // ~100% sichtbar
      },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [reducedMotion])

  return (
    <div ref={containerRef} className="h-full w-full" aria-hidden="true">
      <LottieSvg
        lottieRef={lottieRef}
        src={animationData}
        loop={false}
        autoplay={false}
        subscriptions={{
          complete: () => {
            playedOnce.current = true
            isPlaying.current = false
          },
        }}
      />
    </div>
  )
}

export default LottiePlayer
