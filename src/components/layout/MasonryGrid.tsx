'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

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
	projectTypeFilterOptions = []
}: MasonryGridProps) {
	const [activeProjectType, setActiveProjectType] = useState<string>('all')

	const availableProjectTypes = useMemo(
		() =>
			projectTypeFilterOptions.filter((option) =>
				cards.some((card) => card.projectType === option.value)
			),
		[cards, projectTypeFilterOptions]
	)

	useEffect(() => {
		if (
			activeProjectType !== 'all' &&
			!availableProjectTypes.some((option) => option.value === activeProjectType)
		) {
			setActiveProjectType('all')
		}
	}, [activeProjectType, availableProjectTypes])

	const filteredCards =
		enableProjectTypeFilter && activeProjectType !== 'all'
			? cards.filter((card) => card.projectType === activeProjectType)
			: cards

	const showProjectTypeFilter =
		enableProjectTypeFilter && availableProjectTypes.length > 0

	return (
		<div className="flex flex-col gap-6">
			{showProjectTypeFilter && (
				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						aria-pressed={activeProjectType === 'all'}
						onClick={() => setActiveProjectType('all')}
						className={[
							'rounded-full border px-4 py-2 text-sm font-bold transition-colors duration-200',
							activeProjectType === 'all'
								? 'border-accent bg-accent text-primary'
								: 'border-white/10 bg-secondary-background text-gray-300 hover:border-accent/60 hover:text-white'
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
								'rounded-full border px-4 py-2 text-sm font-bold transition-colors duration-200',
								activeProjectType === option.value
									? 'border-accent bg-accent text-primary'
									: 'border-white/10 bg-secondary-background text-gray-300 hover:border-accent/60 hover:text-white'
							].join(' ')}
						>
							{option.label}
						</button>
					))}
				</div>
			)}

			<motion.div className="columns-1 sm:columns-2 gap-4" layout>
				<AnimatePresence mode="popLayout">
					{filteredCards.map((card) => (
						<motion.div
							key={card.link.url ?? card.headline}
							layout
							initial={{ opacity: 0, y: 16, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 12, scale: 0.98 }}
							transition={{ duration: 0.25, ease: 'easeOut' }}
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
						</motion.div>
					))}
				</AnimatePresence>
			</motion.div>
		</div>
	)
}
