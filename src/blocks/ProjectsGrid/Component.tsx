import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

// Types aus den generierten Payload-Types
import type { ProjectsGridBlock, Project } from '@/payload-types'
import MasonryGrid from '@/components/layout/MasonryGrid'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'
import { CMSLink } from '@/components/Link'

type Props = ProjectsGridBlock & {
	className?: string
}

export const ProjectsGridBlockComponent: React.FC<Props> = async ({
	overhead,
	headline,
	subhead,
	link,
	projectsLimit,
	backgroundVariant = 'primary',
	className
}) => {
	const payload = await getPayload({ config: configPromise })

	const { docs } = await payload.find({
		collection: 'projects',
		limit: projectsLimit ?? 4,
		sort: '-startDate', // letzte Projekte zuerst
		depth: 1
	})

	const projects = docs as Project[]

	if (!projects || projects.length === 0) return null

	const cards = projects.map((project) => {
		const clientSlug =
			typeof project.client === 'string' ? project.client : project.client.slug
		return {
			link: {
				type: 'custom' as const,
				url: `/projekte/${clientSlug}/${project.slug}`,
				label: project.title
			},
			image: project.image ?? null,
			headline: project.title,
			abstract: project.shortDescription,
			tags: project.tags?.map((t) => t.tag).filter(Boolean) ?? [],
			icon: undefined
		}
	})

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
					<h2>
						<span className="text-accent">Websites. E-Commerce.</span>{' '}
						individuelle Lösungen
					</h2>
				)}

				{subhead && <p className="subhead big">{subhead}</p>}

				<MasonryGrid cards={cards} />

				{link && (
					<CMSLink {...link} label={null} className="mx-auto my-5">
						<Button variant="outline" size="lg">
							{link?.label || 'Mehr erfahren'}
							<span className="block bg-accent rounded-full p-1">
								<ArrowUpRight className="stroke-3 text-primary!" />
							</span>
						</Button>
					</CMSLink>
				)}
			</div>
		</section>
	)
}
