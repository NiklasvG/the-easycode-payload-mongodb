import React from 'react'

// Components
import ServiceCard from '@/components/Cards/ServiceCard'

// Types
import type { ServicesBlock } from '@/payload-types'

type Props = ServicesBlock & {
	className?: string
}

export const ServicesBlockComponent: React.FC<Props> = ({
	overhead,
	headline,
	accentText,
	subhead,
	services,
	className
}) => {
	if (!services || services.length === 0) return null

	return (
		<section
			className={['py-10 2xl:py-32 bg-secondary-background', className]
				.filter(Boolean)
				.join(' ')}
		>
			<div className="container flex flex-col gap-6 lg:gap-10">
				{overhead && <p className="overhead">{overhead}</p>}

				{headline && (
					<h2>
						{headline.split(' ').map((word, i) => {
							// kleine Spielerei: wenn das Wort dem AccentText entspricht, highlighten
							if (
								accentText &&
								word.replace(/[.]/g, '') === accentText.replace(/[.]/g, '')
							) {
								return (
									<span key={i} className="text-accent">
										{word + ' '}
									</span>
								)
							}
							return word + ' '
						})}
					</h2>
				)}

				{subhead && <p className="subhead">{subhead}</p>}

				<div className="grid grid-cols-1 lg:grid-cols-2 pt-10 teaser__items">
					{services.map((service, index) => {
						return (
							<ServiceCard
								key={index}
								link={service.link}
								icon={service.icon ?? undefined}
								headline={service.headline}
								abstract={service.abstract}
								tags={
									service.tags
										?.map((t) => t.tag)
										.filter((tag): tag is string => tag != null) ?? []
								}
								options={{ border: service.border ?? true }}
								image={service?.image}
							/>
						)
					})}
				</div>
			</div>
		</section>
	)
}
