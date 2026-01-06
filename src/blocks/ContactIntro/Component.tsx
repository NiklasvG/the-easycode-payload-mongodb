// src/blocks/ContactIntro/Component.tsx
import React from 'react'
import RichText from '@/components/RichText'
import { ContactIntroBlock } from '@/payload-types'
import { highlightPhrase } from '@/utilities/highlightPhrase'

type Props = ContactIntroBlock

export const ContactIntroBlockComponent: React.FC<Props> = ({
	badge,
	headline,
	accentText,
	subline
}) => {
	return (
		<div className="animate-in slide-in-from-left-8 duration-700">
			{badge ? (
				<span className="inline-block py-1 px-3 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold tracking-widest uppercase mb-6">
					{badge}
				</span>
			) : null}

			<h1 className="text-5xl md:text-7xl font-display font-bold mb-8 leading-tight">
				{accentText ? highlightPhrase(headline, accentText) : headline}
			</h1>

			{subline ? (
				<div className="text-xl text-muted-foreground mb-12 max-w-lg leading-relaxed">
					<RichText data={subline} enableGutter={false} />
				</div>
			) : null}
		</div>
	)
}
