'use client'

import React, { useMemo, useState } from 'react'

// Components
import ServiceCard from '@/components/Cards/ServiceCard'

// Types
import type { Media, Page, Post, ServicesBlock } from '@/payload-types'

type LinkProp = {
  type?: 'custom' | 'reference' | null
  newTab?: boolean | null
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
  url?: string | null
  label: string
}

type MasonryCard = {
  projectType?: string | null
  enableTeaserLink: boolean
  link: LinkProp
  icon?: ServicesBlock['services'][0]['icon'] | undefined
  image?: string | Media | null
  imageHint?: string | null
  meta?: string | null
  headline: string
  abstract: string
  tags: string[]
}

interface MasonryGridProps {
  cards: MasonryCard[]
  enableProjectTypeFilter?: boolean
  projectTypeFilterOptions?: {
    value: string
    label: string
  }[]
}

export default function MasonryGrid({
  cards,
  enableProjectTypeFilter = false,
  projectTypeFilterOptions = [],
}: MasonryGridProps) {
  const [selectedProjectType, setActiveProjectType] = useState<string>('all')

  const availableProjectTypes = useMemo(
    () =>
      projectTypeFilterOptions.filter((option) =>
        cards.some((card) => card.projectType === option.value),
      ),
    [cards, projectTypeFilterOptions],
  )

  const activeProjectType = availableProjectTypes.some(
    (option) => option.value === selectedProjectType,
  )
    ? selectedProjectType
    : 'all'

  const filteredCards =
    enableProjectTypeFilter && activeProjectType !== 'all'
      ? cards.filter((card) => card.projectType === activeProjectType)
      : cards

  const showProjectTypeFilter = enableProjectTypeFilter && availableProjectTypes.length > 0

  return (
    <div className="flex flex-col gap-6">
      {showProjectTypeFilter && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Projekte nach Typ filtern">
          <button
            type="button"
            aria-pressed={activeProjectType === 'all'}
            onClick={() => setActiveProjectType('all')}
            className={[
              'min-h-11 max-w-full rounded-full border px-4 py-2 text-sm font-bold [overflow-wrap:anywhere] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent',
              activeProjectType === 'all'
                ? 'border-accent-contrast bg-accent-contrast text-gray-50'
                : 'border-white/10 bg-secondary-background text-gray-300 hover:border-accent/60 hover:text-white',
            ].join(' ')}
          >
            Alle
          </button>
          {availableProjectTypes.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={activeProjectType === option.value}
              onClick={() => setActiveProjectType(option.value)}
              className={[
                'min-h-11 max-w-full rounded-full border px-4 py-2 text-sm font-bold [overflow-wrap:anywhere] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent',
                activeProjectType === option.value
                  ? 'border-accent-contrast bg-accent-contrast text-gray-50'
                  : 'border-white/10 bg-secondary-background text-gray-300 hover:border-accent/60 hover:text-white',
              ].join(' ')}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {showProjectTypeFilter && (
        <p className="sr-only" role="status" aria-live="polite">
          {filteredCards.length} {filteredCards.length === 1 ? 'Projekt' : 'Projekte'} angezeigt
        </p>
      )}
      {filteredCards.length === 0 && (
        <p className="text-muted-foreground">Keine Projekte vorhanden.</p>
      )}
      <div className="columns-1 sm:columns-2 gap-4">
        {filteredCards.map((card, index) => (
          <div
            key={`${card.link.url || card.headline}-${index}`}
            className="mb-4 break-inside-avoid-column"
          >
            <ServiceCard
              enableLink={card.enableTeaserLink}
              link={card.link}
              icon={card.icon}
              image={card.image}
              imageHint={card.imageHint}
              meta={card.meta}
              headline={card.headline}
              abstract={card.abstract}
              tags={card.tags}
              options={{ border: false, highlightTag: true }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
