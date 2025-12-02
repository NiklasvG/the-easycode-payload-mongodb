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
	className,
	id
}) => {
	if (!items || items.length === 0) return null

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
			className={`section--main section--content accordion ${className ?? ''}`}
		>
			<div className="accordion__container grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
				<div className="accordion__text space-y-4">
					{overline && (
						<p className="text-sm uppercase tracking-[0.2em] text-accent">
							{overline}
						</p>
					)}

					{headline && <h2 className="h1">{headline}</h2>}

					{intro && <p className="text-muted-foreground">{intro}</p>}
				</div>

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
