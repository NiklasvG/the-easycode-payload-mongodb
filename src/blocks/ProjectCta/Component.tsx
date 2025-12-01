import React from 'react'
import { ArrowRight } from 'lucide-react'
import type { ProjectCtaBlock } from '@/payload-types'
import { CMSLink } from '@/components/Link'

type Props = ProjectCtaBlock & {
	className?: string
}

export const ProjectCtaBlockComponent: React.FC<Props> = ({
	headline,
	link,
	backgroundVariant = 'secondary',
	className
}) => {
	const bgClass =
		backgroundVariant === 'primary'
			? 'bg-background'
			: 'bg-secondary-background/30'

	return (
		<section
			className={['py-20 border-t border-white/5', bgClass, className]
				.filter(Boolean)
				.join(' ')}
		>
			<div className="container mx-auto px-6 text-center">
				<h2 className="text-2xl md:text-3xl font-display font-bold mb-8">
					{headline}
				</h2>

				{!!link && (
					<CMSLink
						{...link}
						className="inline-flex items-center gap-2 text-accent hover:text-white font-bold text-lg transition-colors border-b-2 border-accent hover:border-white pb-1"
					>
						<ArrowRight className="w-5 h-5" />
					</CMSLink>
				)}
			</div>
		</section>
	)
}
