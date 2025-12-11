// src/blocks/TextIconTimeline/Component.tsx
import React from 'react'
import type { TextIconTimelineBlock, Media } from '@/payload-types'
import { highlightPhrase } from '@/utilities/highlightPhrase'
import { TextIconTimelineSlider } from './Component.client'

type Props = TextIconTimelineBlock & {
	className?: string
}

export const TextIconTimelineBlockComponent: React.FC<Props> = ({
	backgroundVariant = 'primary',
	overhead,
	headline,
	accentText,
	subhead,
	items,
	className
}) => {
	if (!items || !items.length) return null

	const bgClass =
		backgroundVariant === 'primary'
			? 'bg-background'
			: 'bg-secondary-background'

	return (
		<section
			className={['py-12 lg:py-24 2xl:py-32', bgClass, className]
				.filter(Boolean)
				.join(' ')}
		>
			<div className="container flex flex-col gap-6 lg:gap-10">
				{overhead && <p className="overhead">{overhead}</p>}

				{headline && (
					<h2 className="h2">
						{accentText ? highlightPhrase(headline, accentText) : headline}
					</h2>
				)}

				{subhead && <p className="subhead big">{subhead}</p>}

				<TextIconTimelineSlider items={items} />
			</div>
		</section>
	)
}
