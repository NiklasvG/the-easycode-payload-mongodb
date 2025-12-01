import React from 'react'

// Components
import ServiceCard from '@/components/Cards/ServiceCard'

// Types
import type { ServicesBlock } from '@/payload-types'
import { highlightPhrase } from '@/utilities/highlightPhrase'

type Props = ServicesBlock & {
	className?: string
}

export const ServicesBlockComponent: React.FC<Props> = ({
	overhead,
	headline,
	accentText,
	subhead,
	services,
	backgroundVariant = 'secondary',
	className
}) => {
	if (!services || services.length === 0) return null

	const bgClass =
		backgroundVariant === 'primary'
			? 'bg-background'
			: 'bg-secondary-background'

	return (
		<section
			className={['py-24 lg:py-36', bgClass, className]
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
