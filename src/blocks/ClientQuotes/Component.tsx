import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { ClientQuotesBlock, Client } from '@/payload-types'
import { QuoteSlider, type QuoteItem } from './Component.client'

type Props = ClientQuotesBlock & {
	className?: string
}

export const ClientQuotesBlockComponent: React.FC<Props> = async ({
	overhead,
	headline,
	subhead,
	maxQuotes,
	className
}) => {
	const payload = await getPayload({ config: configPromise })

	const { docs } = await payload.find({
		collection: 'clients',
		limit: 100,
		depth: 2
	})

	const clients = docs as Client[]

	const allQuotes: QuoteItem[] = []

	clients.forEach((client) => {
		client.contacts?.forEach((contact) => {
			if (!contact.comment) return

			allQuotes.push({
				text: contact.comment,
				author: contact.name,
				role: contact.position,
				company: client.companyName,
				// zuerst Kontaktbild, sonst Firmenlogo, sonst nichts
				image: (contact.image as any) || (client.logo as any) || null
			})
		})
	})

	if (!allQuotes.length) return null

	const quotes = allQuotes.slice(0, maxQuotes ?? 6)

	return (
		<section
			className={['py-24 lg:py-36 bg-background', className]
				.filter(Boolean)
				.join(' ')}
		>
			<div className="container flex flex-col gap-6 lg:gap-10">
				{overhead && <p className="overhead">{overhead}</p>}

				{headline && <h2>{headline}</h2>}

				{subhead && <p className="subhead big">{subhead}</p>}

				<QuoteSlider quotes={quotes} />
			</div>
		</section>
	)
}
