'use client'

import React from 'react'

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
	enableTeaserLink: boolean
	link: LinkProp
	icon?: ServicesBlock['services'][0]['icon'] | undefined
	image?: string | Media | null
	headline: string
	abstract: string
	tags: string[]
}

interface MasonryGridProps {
	cards: MasonryCard[]
}

export default function MasonryGrid({ cards }: MasonryGridProps) {
	return (
		<div className="columns-1 sm:columns-2 gap-4">
			{cards.map((card, index) => (
				<div key={index} className="mb-4 break-inside-avoid-column">
					<ServiceCard
						enableLink={card.enableTeaserLink}
						link={card.link}
						icon={card.icon}
						image={card.image}
						headline={card.headline}
						abstract={card.abstract}
						tags={card.tags}
						options={{ border: false, highlightTag: true }}
					/>
				</div>
			))}
		</div>
	)
}
