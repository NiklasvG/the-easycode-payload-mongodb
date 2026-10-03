'use client'

import { useEffect, useRef } from 'react'
import { LottieSvg, type LottieHandle } from 'lottie-react'
import { useReducedMotion } from 'framer-motion'

import type { LottieSvgProps } from 'lottie-react'

interface LottiePlayerProps {
  animationData: LottieSvgProps['src']
  triggerPlay: boolean
}

const LottiePlayer = ({ animationData, triggerPlay }: LottiePlayerProps) => {
  const lottieRef = useRef<LottieHandle>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playedOnce = useRef(false)
  const reducedMotion = useReducedMotion()
  const isPlaying = useRef(false)

  // Wenn von außen neu getriggert wird → Reset
  useEffect(() => {
    if (reducedMotion) lottieRef.current?.pause()
    if (triggerPlay) {
      playedOnce.current = false
    }
  }, [triggerPlay, reducedMotion])

  // Normales Verhalten: über Prop triggerPlay steuern (z. B. Hover, Scroll, etc.)
  useEffect(() => {
    if (triggerPlay && !playedOnce.current && !isPlaying.current && !reducedMotion) {
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
          if (entry.isIntersecting && !playedOnce.current && !isPlaying.current && !reducedMotion) {
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
    <div ref={containerRef} className="h-full w-full">
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

