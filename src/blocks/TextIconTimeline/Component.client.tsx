// src/blocks/TextIconTimeline/Component.client.tsx
'use client'

import React, { useRef, useState } from 'react'
import { Splide, Splide as SplideClass, type Options } from '@splidejs/react-splide'
import '@splidejs/splide/css'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { TextIconTimelineBlock } from '@/payload-types'
import LottieIcon from '@/components/shared/Functional/LottieIcon'

export type TimelineItem = NonNullable<TextIconTimelineBlock['items']>[number]

const splideOptions: Options = {
  label: 'Slider mit Text-Icon-Elementen',
  type: 'slide',
  fixedWidth: '82%', // Card ist etwas schmaler als der Viewport
  gap: '1rem',
  trimSpace: false, // kein hartes Abschneiden am Ende
  arrows: false,
  pagination: false,
  speed: 250,
  easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
  reducedMotion: { speed: 0, rewindSpeed: 0 },
}

type Props = {
  items: TimelineItem[]
}

export const TextIconTimelineSlider: React.FC<Props> = ({ items }) => {
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

  if (!items || items.length === 0) return null

  const isFirst = active === 0
  const isLast = active === items.length - 1

  return (
    <div className="text-icon text-icon--slider my-8">
      <div className="hidden md:block">
        <ul className="flex flex-col gap-10">
          {items.map((item, idx) => {
            if (!item) return null

            return (
              <li key={item.id || idx}>
                <TimelineItemComponent item={item} />
              </li>
            )
          })}
        </ul>
      </div>
      <div className="block md:hidden">
        <Splide
          hasTrack={false}
          options={splideOptions}
          className="splide"
          onMounted={(slider) => setActive(slider.index)}
          onMove={(slider) => setActive(slider.index)}
          ref={(splide) => {
            splideRef.current = splide
          }}
          aria-label="Slider mit Text-Icon-Elementen"
          role="region"
        >
          <div className="splide__track">
            <div className="splide__list">
              {items.map((item, idx) => {
                if (!item) return null

                return (
                  <div className="splide__slide" key={item.id || idx}>
                    <TimelineItemComponent item={item} />
                  </div>
                )
              })}
            </div>
          </div>
        </Splide>

        <div className="flex items-center justify-center gap-2 text-icon__navigation mt-4">
          <button
            type="button"
            className={`arrow ${isFirst ? 'opacity-40 pointer-events-none' : ''}`}
            onClick={(event) => go('<', event)}
            aria-label="Vorheriges Element"
            disabled={isFirst}
            aria-disabled={isFirst}
          >
            <ChevronLeft className="stroke-2" />
          </button>

          <ul className="splide__pagination text-icon__pagination">
            {items.map((_, i) => (
              <li key={i}>
                <button
                  type="button"
                  className={`splide__pagination__page ${i === active ? 'is-active' : ''}`}
                  onClick={(event) => go(i, event)}
                  aria-label={`Gehe zu Element ${i + 1}`}
                  aria-current={i === active ? 'true' : undefined}
                />
              </li>
            ))}
          </ul>

          <button
            type="button"
            className={`arrow ${isLast ? 'opacity-40 pointer-events-none' : ''}`}
            onClick={(event) => go('>', event)}
            aria-label="Nächstes Element"
            disabled={isLast}
            aria-disabled={isLast}
          >
            <ChevronRight className="stroke-2" />
          </button>
        </div>
      </div>
    </div>
  )
}

// own component for item
const TimelineItemComponent: React.FC<{
  item: TimelineItem
}> = ({ item }) => {
  const { icon, title, text } = item
  const [playAnimation, setPlayAnimation] = useState(false)

  const handleMouseEnter = () => {
    setPlayAnimation(true)
  }

  const handleMouseLeave = () => {
    setPlayAnimation(false)
  }

  return (
    <div
      className="text-icon__item flex flex-col md:flex-row gap-6 items-start max-w-4xl w-full min-w-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="text-icon__icon avatar shrink-0" aria-hidden="true">
        {icon ? (
          <div className="size-16 relative overflow-hidden">
            <LottieIcon icon={icon} triggerPlay={playAnimation} />
          </div>
        ) : (
          <div className="size-16" />
        )}
      </div>

      <div className="text-icon__content min-w-0 flex flex-col gap-2 [overflow-wrap:anywhere]">
        <h3 className="text-icon__title font-semibold big">{title}</h3>
        <p className="text-icon__text text-muted-foreground big">
          {text.split('\n').map((line, idx) => (
            <span key={idx}>
              {line}
              <br />
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}
