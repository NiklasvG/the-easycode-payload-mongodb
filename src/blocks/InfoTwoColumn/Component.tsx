// src/blocks/InfoTwoColumn/Component.tsx
import React from 'react'
import type { InfoTwoColumnBlock } from '@/payload-types'
import { highlightPhrase } from '@/utilities/highlightPhrase'
import { BadgeCheck } from 'lucide-react'

type Props = InfoTwoColumnBlock & {
	className?: string
}

export const InfoTwoColumnBlockComponent: React.FC<Props> = ({
	overhead,
	headline,
	accentText,
	body,
	listHeadline,
	items,
	backgroundVariant = 'secondary',
	reverseOnDesktop = false,
	className
}) => {
	if (!headline && !body && (!items || items.length === 0)) return null

	const bgClass =
		backgroundVariant === 'primary'
			? 'bg-background'
			: 'bg-secondary-background'

	// Mobile: immer zuerst „links“, dann „rechts“
	const leftColClasses = reverseOnDesktop
		? 'order-1 lg:order-2'
		: 'order-1 lg:order-1'

	const rightColClasses = reverseOnDesktop
		? 'order-2 lg:order-1'
		: 'order-2 lg:order-2'

	return (
		<section
			className={['py-12 lg:py-24 2xl:py-36', bgClass, className]
				.filter(Boolean)
				.join(' ')}
		>
			<div className="container grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
				{/* Linke Spalte: Overline + Headline */}
				<div className={leftColClasses}>
					{overhead && <p className="overhead mb-3">{overhead}</p>}

					{headline && (
						<h2 className="h2">
							{accentText ? highlightPhrase(headline, accentText) : headline}
						</h2>
					)}
				</div>

				{/* Rechte Spalte: Text + Vorteils-Liste */}
				<div className={rightColClasses}>
					{body && <p className="mb-8 lg:mb-16 big">{body}</p>}

					{listHeadline && <p className="h5 mb-5">{listHeadline}</p>}

					{items && items.length > 0 && (
						<ul className="list list--check list--icon list--line space-y-2">
							{items.map((item, index) => (
								<li
									key={index}
									className="flex items-center gap-3 py-6 border-t border-white/20"
								>
									<BadgeCheck className="size-8 text-accent" /> {item.text}
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</section>
	)
}
