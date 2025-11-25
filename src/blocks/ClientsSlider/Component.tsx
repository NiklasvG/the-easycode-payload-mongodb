import React from 'react'

// Libraries
import configPromise from '@payload-config'
import { getPayload } from 'payload'

// Components
import { LogoSlider } from './Component.client'

// Types
export type ClientsSliderProps = {
	heading?: string
	blockType: 'clientsSlider'
}

type Props = ClientsSliderProps & {
	className?: string
}

export const ClientsSliderBlock: React.FC<Props> = async ({
	className,
	heading
}) => {
	const payload = await getPayload({ config: configPromise })

	const { docs: clients } = await payload.find({
		collection: 'clients',
		where: {
			logo: {
				exists: true
			}
		},
		depth: 1,
		limit: 100
	})

	const logos =
		clients
			?.map((client) => {
				const media = client.logo as any
				const url: string | undefined = media?.url

				if (!url) return null

				return {
					src: url,
					alt: client.companyName,
					// optional: einheitliche Höhe
					height: 80
				}
			})
			.filter(Boolean) ?? []

	if (!logos.length) return null

	return (
		<section
			className={['py-10 2xl:pb-20', className].filter(Boolean).join(' ')}
		>
			{heading && (
				<h2 className="mb-6 text-center text-2xl font-semibold">{heading}</h2>
			)}

			<LogoSlider
				logos={logos as { src: string; alt: string; height?: number }[]}
			/>
		</section>
	)
}
