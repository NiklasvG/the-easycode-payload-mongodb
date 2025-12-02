import React from 'react'
import type { FAQBlock } from '@/payload-types'
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent
} from '@/components/ui/accordion'

type Props = FAQBlock & {
	className?: string
	id?: string
}

export const FAQBlockComponent: React.FC<Props> = ({
	overline,
	headline,
	intro,
	items,
	backgroundVariant = 'primary',
	className,
	id
}) => {
	if (!items || items.length === 0) return null

	const bgClass =
		backgroundVariant === 'primary'
			? 'bg-background'
			: 'bg-secondary-background'

	const faqJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items.map((item) => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.answer
			}
		}))
	}

	return (
		<section
			id={id}
			className={['py-12 lg:py-24 2xl:py-36', bgClass, className]
				.filter(Boolean)
				.join(' ')}
		>
			<div className="container grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
				{/* Linke Spalte: Overline + Headline */}
				<div>
					{overline && <p className="overhead mb-3">{overline}</p>}

					{headline && <h2 className="h2">{headline}</h2>}

					{intro && <p className="subhead big">{intro}</p>}
				</div>

				{/* Rechte Spalte: FAQ */}
				<div data-js="accordion">
					<Accordion
						type="single"
						collapsible
						className="w-full"
						defaultValue={items[0]?.question ? `item-0` : undefined}
					>
						{items.map((item, index) => (
							<AccordionItem
								key={index}
								value={`item-${index}`}
								className="accordion__item"
							>
								<AccordionTrigger className="accordion__head">
									{item.question}
								</AccordionTrigger>
								<AccordionContent className="accordion__body">
									<p>{item.answer}</p>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</div>

			{/* FAQ Schema.org JSON-LD */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
			/>
		</section>
	)
}
