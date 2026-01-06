// src/blocks/SplitLayout/Component.tsx
import React, { Fragment } from 'react'
import type { Page, SplitLayoutBlock } from '@/payload-types'
import { blockComponents } from '../RenderBlocks'

type Props = SplitLayoutBlock

const gapClass = (gap?: Props['gap']) => {
	switch (gap) {
		case 'sm':
			return 'gap-8'
		case 'md':
			return 'gap-12'
		case 'lg':
		default:
			return 'gap-16'
	}
}

const colsClass = (layout?: Props['layout']) => {
	switch (layout) {
		case '40-60':
			return 'lg:grid-cols-[2fr_3fr]'
		case '60-40':
			return 'lg:grid-cols-[3fr_2fr]'
		case '50-50':
		default:
			return 'lg:grid-cols-2'
	}
}

const RenderNestedBlocks: React.FC<{ blocks?: Page['layout'] }> = ({
	blocks
}) => {
	const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0
	if (!hasBlocks) return null

	let previousBackground: string | null = null

	return (
		<Fragment>
			{blocks.map((block, index) => {
				const { blockType } = block as any
				const backgroundVariant =
					'backgroundVariant' in (block as any)
						? (block as any).backgroundVariant
						: null

				if (blockType && blockType in blockComponents) {
					const Block = (blockComponents as any)[blockType]

					const sameBackground =
						previousBackground &&
						backgroundVariant &&
						previousBackground === backgroundVariant

					const firstPrimary = index === 0 && backgroundVariant === 'primary'

					const outerClassName =
						sameBackground || firstPrimary ? '-mt-12 lg:-mt-16' : 'mt-0'

					previousBackground = backgroundVariant ?? null

					if (Block) {
						return (
							<div key={index} className={outerClassName}>
								<Block {...(block as any)} />
							</div>
						)
					}
				}

				return null
			})}
		</Fragment>
	)
}

export const SplitLayoutBlockComponent: React.FC<Props> = ({
	layout = '50-50',
	gap = 'lg',
	left,
	right
}) => {
	return (
		<section className="py-12 lg:py-24 2xl:py-32">
			<div
				className={`container grid items-start ${colsClass(layout)} ${gapClass(gap)}`}
			>
				<div>
					<RenderNestedBlocks blocks={left ?? undefined} />
				</div>
				<div>
					<RenderNestedBlocks blocks={right ?? undefined} />
				</div>
			</div>
		</section>
	)
}
