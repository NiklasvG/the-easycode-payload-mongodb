import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { ClientsSliderBlock } from '@/blocks/ClientsSlider/Component'
import { ClientQuotesBlockComponent } from './ClientQuotes/Component'
import { ServicesBlockComponent } from './Services/Component'
import { ProjectsGridBlockComponent } from './ProjectsGrid/Component'
import { InfoTwoColumnBlockComponent } from './InfoTwoColumn/Component'
import { ProjectCtaBlockComponent } from './ProjectCta/Component'
import { FAQBlockComponent } from './FAQ/Component'

const blockComponents = {
	archive: ArchiveBlock,
	content: ContentBlock,
	cta: CallToActionBlock,
	formBlock: FormBlock,
	mediaBlock: MediaBlock,
	clientsSlider: ClientsSliderBlock,
	clientQuotes: ClientQuotesBlockComponent,
	services: ServicesBlockComponent,
	projectsGrid: ProjectsGridBlockComponent,
	infoTwoColumn: InfoTwoColumnBlockComponent,
	projectCta: ProjectCtaBlockComponent,
	faq: FAQBlockComponent
}

export const RenderBlocks: React.FC<{
	blocks: Page['layout'][0][]
}> = (props) => {
	const { blocks } = props

	const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

	if (!hasBlocks) return null

	// if the current block has same backgroundVariant like previous block, we reduce the padding
	let previousBackground: string | null = null
	return (
		<Fragment>
			{blocks.map((block, index) => {
				const { blockType } = block
				const backgroundVariant =
					'backgroundVariant' in block ? block.backgroundVariant : null

				if (blockType && blockType in blockComponents) {
					const Block = blockComponents[blockType]

					// Prüfen, ob gleiche Hintergrundfarbe wie vorher
					const sameBackground =
						previousBackground &&
						backgroundVariant &&
						previousBackground === backgroundVariant

					// Dynamische Margin (kannst du beliebig anpassen)
					const outerClassName = sameBackground
						? '-mt-16' // → enger zusammen
						: 'mt-0' // → normaler Abstand

					// für nächsten Durchlauf speichern
					previousBackground = backgroundVariant ?? null

					if (Block) {
						return (
							<div key={index} className={outerClassName}>
								{/* @ts-expect-error there may be some mismatch between the expected types here */}
								<Block {...block} disableInnerContainer />
							</div>
						)
					}
				}
				return null
			})}
		</Fragment>
	)
}
