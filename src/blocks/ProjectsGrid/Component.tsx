import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

// Types aus den generierten Payload-Types
import type { ProjectsGridBlock, Project } from '@/payload-types'
import MasonryGrid from '@/components/layout/MasonryGrid'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

type Props = ProjectsGridBlock & {
	className?: string
}

export const ProjectsGridBlockComponent: React.FC<Props> = async ({
	overhead,
	headline,
	subhead,
	projectsPageUrl,
	projectsLimit,
	className
}) => {
	const payload = await getPayload({ config: configPromise })

	const { docs } = await payload.find({
		collection: 'projects',
		limit: projectsLimit ?? 4,
		sort: '-createdAt', // letzte Projekte zuerst
		depth: 1
	})

	const projects = docs as Project[]

	if (!projects || projects.length === 0) return null

	const cards = projects.map((project) => {
		return {
			link: {
				type: 'custom' as const,
				url: `/projekte/${project.slug}`, // ggf. Route anpassen
				label: project.title
			},
			image: project.image ?? null,
			headline: project.title,
			abstract: project.abstract,
			tags: project.tags?.map((t) => t.tag).filter(Boolean) ?? [],
			icon: undefined
		}
	})

	return (
		<section
			className={['py-10 2xl:py-32 bg-background', className]
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

				{subhead && <p className="subhead">{subhead}</p>}

				<MasonryGrid cards={cards} />

				{projectsPageUrl && (
					<Link href={projectsPageUrl} className="mx-auto my-5">
						<Button variant="outline" size="lg">
							Alle Projekte
							<span className="block bg-accent rounded-full p-1">
								<ArrowUpRight className="stroke-3 text-primary!" />
							</span>
						</Button>
					</Link>
				)}
			</div>
		</section>
	)
}
