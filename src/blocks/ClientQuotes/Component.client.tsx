'use client'

import React, { useRef, useState } from 'react'
import { Splide, Splide as SplideClass, Options } from '@splidejs/react-splide'
import '@splidejs/splide/css'
import { ChevronLeft, ChevronRight, Quote as QuoteIcon } from 'lucide-react'

import type { Media } from '@/payload-types'
import Image from 'next/image'
import { AIImageBadge } from '@/components/AIImageBadge'

export type QuoteItem = {
  text: string
  author: string
  role?: string | null
  company?: string | null
  image?: Media | null
}

const splideOptions: Options = {
  label: 'Kundenstimmen',
  type: 'slide',
  rewind: true,
  perPage: 1,
  arrows: false,
  pagination: false,
  gap: '1rem',
  speed: 250,
  easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
  reducedMotion: { speed: 0, rewindSpeed: 0 },
}

type Props = {
  quotes: QuoteItem[]
}

export const QuoteSlider: React.FC<Props> = ({ quotes }) => {
  const splideRef = useRef<SplideClass | null>(null)
  const [active, setActive] = useState(0)
  const go = (control: string | number, event: React.MouseEvent<HTMLButtonElement>) => {
    const slider = splideRef.current?.splide
    if (!slider) return
    slider.options = {
      speed:
        event.detail === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 0
          : 250,
    }
    slider.go(control)
  }

  if (!quotes || quotes.length === 0) return null

  return (
    <div className="quote mt-10 lg:mt-20">
      <Splide
        hasTrack={false}
        options={splideOptions}
        className="splide"
        aria-label="Kundenstimmen"
        onMounted={(slider) => setActive(slider.index)}
        onMove={(slider) => setActive(slider.index)}
        ref={(splide) => {
          splideRef.current = splide
        }}
      >
        <div className="splide__track">
          <div className="splide__list">
            {quotes.map((q, idx) => (
              <div className="splide__slide" key={idx}>
                <div className="slide">
                  <figure className="quote__flex">
                    <div className="quote__person">
                      <QuoteIcon className="quote__icon" aria-hidden="true" />
                      <div className="avatar relative">
                        {q.image?.url ? (
                          <div className="quote__image relative">
                            <Image
                              src={q.image.url!}
                              alt={q.image.alt || q.company || 'EasyCode Kunde'}
                              fill
                              className="w-full h-full object-cover"
                              quality={85}
                              sizes="(min-width: 1920px) 9.375vw, (min-width: 1440px) 11.806vw, max(7.5rem, calc(4.46vw + 6.6rem))"
                            />
                          </div>
                        ) : (
                          <div className="quote__image bg-muted" />
                        )}
                        <AIImageBadge resource={q.image} compact />
                      </div>
                      <figcaption className="quote__caption">
                        <span className="quote__name">{q.author}</span>
                        {q.role && <span className="quote__position">{q.role}</span>}
                        {q.company && <span className="quote__company">{q.company}</span>}
                      </figcaption>
                    </div>
                    <blockquote className="quote__content">
                      <p className="quote__text">{q.text}</p>
                    </blockquote>
                  </figure>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Splide>

      {quotes.length > 1 && (
        <div className="flex items-center justify-center gap-2 quote_navigation lg:mt-4">
          <button
            type="button"
            className="arrow"
            onClick={(event) => go('<', event)}
            aria-label="Vorheriges Zitat"
          >
            <ChevronLeft className="stroke-2" />
          </button>

          <ul className="splide__pagination quote__pagination">
            {quotes.map((_, i) => (
              <li key={i}>
                <button
                  type="button"
                  className={`splide__pagination__page ${i === active ? 'is-active' : ''}`}
                  onClick={(event) => go(i, event)}
                  aria-label={`Gehe zu Zitat ${i + 1}`}
                  aria-current={i === active ? 'true' : undefined}
                />
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="arrow"
            onClick={(event) => go('>', event)}
            aria-label="Nächstes Zitat"
          >
            <ChevronRight className="stroke-2" />
          </button>
        </div>
      )}
    </div>
  )
}
