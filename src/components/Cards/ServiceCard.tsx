'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Libraries
import dynamic from 'next/dynamic'
import { ArrowUpRight, BadgeCheck, Info } from 'lucide-react'

// Components
import { Media as MediaComponent } from '@/components/Media'
import { CMSLink } from '@/components/Link'
const LottieIcon = dynamic(() => import('@/components/shared/Functional/LottieIcon'), {
  ssr: false,
})

// Types
import { Media, Page, Post, ServicesBlock } from '@/payload-types'
interface optionsProps {
  border?: boolean
  highlightTag?: boolean
}

interface ServiceCardProps {
  enableLink: boolean
  link: {
    type?: 'custom' | 'reference' | null | undefined
    newTab?: boolean | null | undefined
    reference?:
      | {
          relationTo: 'pages'
          value: string | Page
        }
      | {
          relationTo: 'posts'
          value: string | Post
        }
      | null
      | undefined
    url?: string | null
    label: string
  }
  icon?: ServicesBlock['services'][0]['icon'] | undefined
  image?: string | Media | null | undefined
  imageHint?: string | null | undefined
  meta?: string | null | undefined
  headline: string
  abstract: string
  tags: string[]
  options?: optionsProps
  items?: {
    text: string
  }[]
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  enableLink,
  link,
  icon,
  image,
  imageHint,
  meta,
  headline,
  abstract,
  items,
  tags,
  options = {
    border: true,
    highlightTag: false,
  },
}) => {
  const [playAnimation, setPlayAnimation] = useState(false)
  const hintId = useId()
  const hintTrigger = useRef<HTMLButtonElement>(null)
  const [hintPosition, setHintPosition] = useState<{
    left: number
    top: number
    above: boolean
  } | null>(null)
  const hintOpen = hintPosition !== null

  useEffect(() => {
    if (!hintOpen) return
    const hideHint = () => setHintPosition(null)
    window.addEventListener('scroll', hideHint, true)
    window.addEventListener('resize', hideHint)
    return () => {
      window.removeEventListener('scroll', hideHint, true)
      window.removeEventListener('resize', hideHint)
    }
  }, [hintOpen])

  const showHint = () => {
    const rect = hintTrigger.current?.getBoundingClientRect()
    if (!rect) return
    setHintPosition({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 264)),
      top: rect.top >= 120 ? rect.top - 8 : rect.bottom + 8,
      above: rect.top >= 120,
    })
  }
  const hasImage = Boolean(image && typeof image === 'object' && image.url)
  const hasLink =
    enableLink &&
    Boolean(
      link.type === 'reference'
        ? link.reference?.value &&
            typeof link.reference.value === 'object' &&
            link.reference.value.slug
        : link.url,
    )

  const handleMouseEnter = () => {
    setPlayAnimation(true)
  }

  const handleMouseLeave = () => {
    setPlayAnimation(false)
  }

  return (
    <article
      className={`service-card group min-w-0 flex-col [overflow-wrap:anywhere] ${hasLink ? 'service-card--linked' : ''} ${
        !options.border ? 'no-border' : ''
      } ${hasImage ? 'image-teaser' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {icon && (
        <div className="service-card--icon shrink-0">
          <LottieIcon icon={icon} triggerPlay={playAnimation} />
        </div>
      )}
      {hasImage && (
        <div className="image-teaser__image">
          {imageHint && (
            <div className="image-teaser__hint group/hint">
              <button
                ref={hintTrigger}
                type="button"
                className="image-teaser__hint-trigger min-h-11"
                aria-label="Hinweis zum Vorschaubild anzeigen"
                aria-describedby={hintOpen ? hintId : undefined}
                onFocus={showHint}
                onBlur={() => setHintPosition(null)}
                onMouseEnter={showHint}
                onMouseLeave={() => {
                  if (document.activeElement !== hintTrigger.current) setHintPosition(null)
                }}
                onClick={(event) => {
                  event.stopPropagation()
                  showHint()
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    event.stopPropagation()
                    setHintPosition(null)
                  }
                }}
              >
                <span>Info</span>
                <Info className="size-4" aria-hidden="true" />
              </button>
            </div>
          )}
          <MediaComponent
            className=""
            imgClassName="object-cover w-full h-full"
            size="(max-width: 639px) calc(100vw - 64px), (max-width: 767px) 256px, (max-width: 1023px) 288px, (max-width: 1279px) 408px, (max-width: 1535px) 536px, (max-width: 1919px) calc(648px - 4.45vw), calc(36.25vw - 8px)"
            resource={image}
          />
        </div>
      )}
      {hintPosition &&
        imageHint &&
        createPortal(
          <div
            id={hintId}
            className="ai-image-tooltip [overflow-wrap:anywhere]"
            role="tooltip"
            style={{
              left: hintPosition.left,
              top: hintPosition.top,
              transform: hintPosition.above ? 'translateY(-100%)' : undefined,
            }}
          >
            {imageHint}
          </div>,
          document.body,
        )}

      {meta && (
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {meta}
        </p>
      )}

      <div className="flex min-w-0 gap-4 items-start">
        <h3
          className={`teaser__title min-w-0 ${hasLink ? 'group-hover:underline group-focus-within:underline' : ''}`}
        >
          {!hasLink ? (
            <>{headline}</>
          ) : (
            <CMSLink
              {...link}
              label={link.label || headline}
              className="after:absolute after:inset-0 after:z-10"
            />
          )}
        </h3>
        {hasLink && (
          <span
            aria-hidden="true"
            className="shrink-0 flex items-center justify-center bg-accent rounded-full size-7 sm:size-8"
          >
            <ArrowUpRight className="stroke-3 text-primary! size-5 sm:size-6 shrink-0" />
          </span>
        )}
      </div>
      <div className="teaser__text min-w-0">
        {abstract && <p className="pb-6 2xl:pb-8 big">{abstract}</p>}
        {items && items.length > 0 && (
          <ul className="list list--check list--icon list--line space-y-2 mb-0!">
            {items.map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <BadgeCheck aria-hidden="true" className="size-6 shrink-0 text-accent" />{' '}
                {item.text}
              </li>
            ))}
          </ul>
        )}
        {tags.length > 0 && (
          <ul className="list list--tag mt-4">
            {tags.map((tag, index) => (
              <li
                className={`${index === 0 && options.highlightTag ? 'highlight' : ''}`}
                key={index}
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

export default ServiceCard
