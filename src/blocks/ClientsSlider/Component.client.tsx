'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import { AIImageBadge } from '@/components/AIImageBadge'
import { Splide, Options } from '@splidejs/react-splide'
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { usePrefersReducedMotion } from '@/utilities/usePrefersReducedMotion'

import '@splidejs/splide/css'

interface Logo {
  src: string
  alt: string
  companyName: string
  width?: number
  height?: number
  imageWidth?: number
  imageHeight?: number
  isAIGenerated?: boolean | null
}

interface LogoSliderProps {
  logos: Logo[]
  options?: Options
  logoHeight?: number
}

const defaultOptions: Options = {
  label: 'Kundenlogos',
  type: 'loop', // Endlosschleife
  perPage: 5, // Anzahl Logos pro Ansicht
  gap: '1rem', // Abstand tussen Logos
  arrows: false,
  reducedMotion: { speed: 0, rewindSpeed: 0, autoScroll: false },
  pagination: false,
  drag: 'free', // Freies Draggen
  snap: true, // Snap-Funktion nach Slide
  autoScroll: {
    // kontinuierliches Scrollen
    speed: 0.8, // Geschwindigkeit (je höher, desto schneller)
    pauseOnHover: true,
    pauseOnFocus: true,
    rewind: false, // kein Zurücksetzen nötig
  },
  breakpoints: {
    640: { perPage: 2 },
    768: { perPage: 3 },
    1024: { perPage: 4 },
  },
}

export const LogoSlider: React.FC<LogoSliderProps> = ({ logos, options, logoHeight = 60 }) => {
  const sliderRef = useRef<Splide | null>(null)
  const container = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const id = useId()
  const go = (control: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const slider = sliderRef.current?.splide
    if (!slider) return
    setPaused(true)
    slider.options = { speed: event.detail === 0 || reducedMotion ? 0 : 250 }
    slider.go(control)
  }

  useEffect(() => {
    const element = container.current
    if (!element) return
    const slider = sliderRef.current?.splide
    let visible = false
    const syncPlayback = () => {
      const autoScroll = slider?.Components.AutoScroll
      if (paused || reducedMotion || document.hidden || !visible || logos.length < 2)
        autoScroll?.pause()
      else autoScroll?.play()
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      syncPlayback()
    })
    observer.observe(element)
    syncPlayback()
    document.addEventListener('visibilitychange', syncPlayback)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', syncPlayback)
      slider?.Components.AutoScroll?.pause()
    }
  }, [paused, reducedMotion, logos.length])

  if (!logos.length) return null
  return (
    <div ref={container} className="splide-slider">
      <Splide
        ref={sliderRef}
        id={id}
        hasTrack={false}
        options={{
          ...defaultOptions,
          ...options,
          type: logos.length > 1 ? 'loop' : 'slide',
          autoScroll: {
            ...(typeof defaultOptions.autoScroll === 'object' ? defaultOptions.autoScroll : {}),
            ...(typeof options?.autoScroll === 'object' ? options.autoScroll : {}),
            autoStart: false,
          },
        }}
        extensions={{ AutoScroll }}
        aria-label="Kundenlogos"
      >
        <div className="splide__track">
          <div className="splide__list">
            {logos.map((logo, idx) => (
              <div className="splide__slide" key={idx}>
                <div className="flex items-center justify-center p-4">
                  <div
                    className="relative w-full flex items-center justify-center"
                    style={{ height: `${logo.height || logoHeight}px` }}
                    title={logo.companyName}
                  >
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={logo.imageWidth || 80}
                      height={logo.imageHeight || 80}
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                      sizes={`${Math.ceil((logo.height || logoHeight) * ((logo.imageWidth || 80) / (logo.imageHeight || 80)))}px`}
                    />
                    <AIImageBadge resource={logo} compact />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Splide>
      {logos.length > 1 && (
        <div className="container mt-8 sm:mt-10 flex items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/20"
            aria-label="Vorherige Kundenlogos"
            aria-controls={id}
            onClick={(event) => go('<', event)}
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-4 text-sm motion-reduce:hidden"
            aria-label={paused ? 'Kundenlogos fortsetzen' : 'Kundenlogos pausieren'}
            aria-pressed={paused}
            aria-controls={id}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? (
              <Play className="size-4" aria-hidden="true" />
            ) : (
              <Pause className="size-4" aria-hidden="true" />
            )}
            {paused ? 'Fortsetzen' : 'Pausieren'}
          </button>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/20"
            aria-label="Nächste Kundenlogos"
            aria-controls={id}
            onClick={(event) => go('>', event)}
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
