// src/blocks/TextIconTimeline/Component.client.tsx
'use client'

import React, { useRef, useState } from 'react'
import {
	Splide,
	SplideSlide,
	Splide as SplideClass,
	type Options
} from '@splidejs/react-splide'
import '@splidejs/splide/css'
import '@splidejs/splide/css/core'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { TextIconTimelineBlock } from '@/payload-types'
import LottieIcon from '@/components/shared/Functional/LottieIcon'

export type TimelineItem = NonNullable<TextIconTimelineBlock['items']>[number]

const splideOptions: Options = {
	type: 'slide',
	fixedWidth: '82%', // Card ist etwas schmaler als der Viewport
	gap: '1rem',
	trimSpace: false, // kein hartes Abschneiden am Ende
	arrows: false,
	pagination: false // wir nutzen eigene Pagination
}

type Props = {
	items: TimelineItem[]
}

export const TextIconTimelineSlider: React.FC<Props> = ({ items }) => {
	const splideRef = useRef<SplideClass | null>(null)
	const [active, setActive] = useState(0)

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
					{items.map((item, idx) => {
						if (!item) return null

						return (
							<SplideSlide key={item.id || idx}>
								<TimelineItemComponent item={item} />
							</SplideSlide>
						)
					})}
				</Splide>

				<div className="flex items-center justify-center gap-2 text-icon__navigation mt-4">
					<button
						className={`arrow ${isFirst ? 'opacity-40 pointer-events-none' : ''}`}
						onClick={() => splideRef.current?.splide?.go('<')}
						aria-label="Vorheriges Element"
						disabled={isFirst}
						aria-disabled={isFirst}
					>
						<ChevronLeft className="stroke-2" />
					</button>

					<ul className="splide__pagination text-icon__pagination">
						{items.map((_, i) => (
							<li key={i} role="presentation">
								<button
									className={`splide__pagination__page ${
										i === active ? 'is-active' : ''
									}`}
									onClick={() => splideRef.current?.splide?.go(i)}
									aria-label={`Gehe zu Element ${i + 1}`}
								/>
							</li>
						))}
					</ul>

					<button
						className={`arrow ${isLast ? 'opacity-40 pointer-events-none' : ''}`}
						onClick={() => splideRef.current?.splide?.go('>')}
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
			className="text-icon__item flex gap-6 items-start max-w-4xl w-full"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<div className="text-icon__icon avatar shrink-0 hidden md:block">
				{icon ? (
					<div className="size-16 relative overflow-hidden">
						<LottieIcon icon={icon} triggerPlay={playAnimation} />
					</div>
				) : (
					<div className="size-16" />
				)}
			</div>

			<div className="text-icon__content flex flex-col gap-2">
				<div className="text-icon__icon avatar shrink-0 block md:hidden">
					{icon ? (
						<div className="size-16 relative overflow-hidden">
							<LottieIcon icon={icon} triggerPlay={playAnimation} />
						</div>
					) : (
						<div className="size-16" />
					)}
				</div>
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
