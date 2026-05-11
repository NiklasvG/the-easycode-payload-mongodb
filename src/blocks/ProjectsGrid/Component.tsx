import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { ProjectsGridBlock, Project } from '@/payload-types'
import MasonryGrid from '@/components/layout/MasonryGrid'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'
import { CMSLink } from '@/components/Link'

type Props = ProjectsGridBlock & {
	className?: string
}

// Mapping von Value -> Label wie im Select-Feld
const projectTypeLabelMap: Record<string, string> = {
	'brand-webseite': 'Brand Webseite',
	individualsoftware: 'Individualsoftware',
	'e-commerce': 'E-Commerce',
	'app-entwicklung': 'App-Entwicklung',
	hosting: 'Hosting'
}

function getProjectTypeLabel(value?: string | null): string | null {
	if (!value) return null
	return projectTypeLabelMap[value] ?? null
}

function formatProjectDateRange(
	startDate?: string | null,
	endDate?: string | null
): string | null {
	if (!startDate) return null

	const dateFormatter = new Intl.DateTimeFormat('de-DE', {
		month: 'short',
		year: 'numeric'
	})

	const start = dateFormatter.format(new Date(startDate))
	const end = endDate ? dateFormatter.format(new Date(endDate)) : 'laufend'

	return start === end ? start : `${start} - ${end}`
}

export const ProjectsGridBlockComponent: React.FC<Props> = async ({
	overhead,
	headline,
	subhead,
	link,
	projectsLimit,
	backgroundVariant = 'primary',
	projectTypes,
	enableProjectTypeFilter,
	className
}) => {
	const payload = await getPayload({ config: configPromise })

	const query: any = {
		collection: 'projects',
		limit: projectsLimit ?? 4,
		sort: '-startDate',
		depth: 1
	}

	// 🔽 Wenn im Block Kategorien ausgewählt sind -> nach projectType filtern
	if (projectTypes && Array.isArray(projectTypes) && projectTypes.length > 0) {
		query.where = {
			projectType: {
				in: projectTypes
			}
		}
	}

	const { docs } = await payload.find(query)

	const projects = docs as Project[]

	if (!projects || projects.length === 0) return null

	const cards = projects.map((project) => {
		const clientSlug =
			typeof project.client === 'string' ? project.client : project.client.slug

		// 🔽 Kategorie-Label ermitteln
		const categoryLabel = getProjectTypeLabel(
			(project as any).projectType as string | null
		)

		// 🔽 Kategorie als erster Tag, danach alle regulären Tags
		const tags = [
			...(categoryLabel ? [categoryLabel] : []),
			...(project.tags?.map((t) => t.tag).filter(Boolean) ?? [])
		]

		return {
			projectType: project.projectType,
			enableTeaserLink: true,
			link: {
				type: 'custom' as const,
				url: `/projekte/${clientSlug}/${project.slug}`,
				label: project.title
			},
			image: project.image ?? null,
			imageHint: project.imageHint ?? null,
			meta: formatProjectDateRange(project.startDate, project.endDate),
			headline: project.title,
			abstract: project.shortDescription,
			tags,
			icon: undefined
		}
	})

	const projectTypeFilterOptions = Object.entries(projectTypeLabelMap)
		.filter(([value]) => cards.some((card) => card.projectType === value))
		.map(([value, label]) => ({ value, label }))

	const bgClass =
		backgroundVariant === 'primary'
			? 'bg-background'
			: 'bg-secondary-background'

	return (
		<section
			className={['py-12 lg:py-24 2xl:py-32', bgClass, className]
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
					// Optional: wenn du wirklich das Feld nutzen willst:
					// <h2>{headline}</h2>
				)}

				{subhead && <p className="subhead big">{subhead}</p>}

				<MasonryGrid
					cards={cards}
					enableProjectTypeFilter={enableProjectTypeFilter ?? false}
					projectTypeFilterOptions={projectTypeFilterOptions}
				/>

				{link?.label !== 'no-link' && (
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
