'use client'

import React, { useRef, useState } from 'react'
import {
	Splide,
	SplideSlide,
	Splide as SplideClass,
	Options
} from '@splidejs/react-splide'
import '@splidejs/splide/css'
import '@splidejs/splide/css/core'
import { ChevronLeft, ChevronRight, Quote as QuoteIcon } from 'lucide-react'

import type { Media } from '@/payload-types'
import Image from 'next/image'

export type QuoteItem = {
	text: string
	author: string
	role?: string | null
	company?: string | null
	image?: Media | null
}

const splideOptions: Options = {
	type: 'loop',
	perPage: 1,
	arrows: false,
	pagination: false,
	gap: '1rem',
	speed: 600
}

type Props = {
	quotes: QuoteItem[]
}

export const QuoteSlider: React.FC<Props> = ({ quotes }) => {
	const splideRef = useRef<SplideClass | null>(null)
	const [active, setActive] = useState(0)

	if (!quotes || quotes.length === 0) return null

	return (
		<div className="quote mt-10 lg:mt-20">
			<Splide
				options={splideOptions}
				className="splide"
				onMounted={(slider) => setActive(slider.index)}
				onMove={(slider) => setActive(slider.index)}
				ref={(splide) => {
					splideRef.current = splide
				}}
			>
				{quotes.map((q, idx) => (
					<SplideSlide key={idx}>
						<div className="slide">
							<figure className="quote__flex">
								<div className="quote__person">
									<QuoteIcon className="quote__icon" />
									<div className="avatar">
										{q.image ? (
											<div className="quote__image">
												<Image
													src={q.image.url!}
													alt={q.image.alt || q.company || 'EasyCode Kunde'}
													priority={idx === 0}
													fill
													className="w-full h-full object-cover"
													sizes="(max-width: 1024px) 100vw, 1200px"
												/>
											</div>
										) : (
											<div className="quote__image bg-muted" />
										)}
									</div>
									<figcaption className="quote__caption">
										<span className="quote__name">{q.author}</span>
										{q.role && (
											<span className="quote__position">{q.role}</span>
										)}
										{q.company && (
											<span className="quote__company">{q.company}</span>
										)}
									</figcaption>
								</div>
								<blockquote className="quote__content">
									<p className="quote__text">{q.text}</p>
								</blockquote>
							</figure>
						</div>
					</SplideSlide>
				))}
			</Splide>

			<div className="flex items-center justify-center gap-2 quote_navigation lg:mt-4">
				<button
					className="arrow"
					onClick={() => splideRef.current?.go('<')}
					aria-label="Vorheriges Zitat"
				>
					<ChevronLeft className="stroke-2" />
				</button>

				<ul className="splide__pagination quote__pagination">
					{quotes.map((_, i) => (
						<li key={i} role="representation">
							<button
								className={`splide__pagination__page ${
									i === active ? 'is-active' : ''
								}`}
								onClick={() => splideRef.current?.go(i)}
								aria-label={`Gehe zu Zitat ${i + 1}`}
							/>
						</li>
					))}
				</ul>

				<button
					className="arrow"
					onClick={() => splideRef.current?.go('>')}
					aria-label="Nächstes Zitat"
				>
					<ChevronRight className="stroke-2" />
				</button>
			</div>
		</div>
	)
}
