import React from 'react'
import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'

import type { ProjectsGridBlock, Project } from '@/payload-types'
import MasonryGrid from '@/components/layout/MasonryGrid'
import { ArrowUpRight } from 'lucide-react'
import { CMSLink } from '@/components/Link'
import { getProjectPath } from '@/utilities/contentPaths'
import { highlightPhrase } from '@/utilities/highlightPhrase'

type Props = ProjectsGridBlock & {
  className?: string
}

import {
  projectTypeLabels as projectTypeLabelMap,
  getProjectTypeLabel,
  formatProjectDateRange,
} from '@/utilities/projectPresentation'

export const ProjectsGridBlockComponent: React.FC<Props> = async ({
  overhead,
  headline,
  subhead,
  link,
  projectsLimit,
  backgroundVariant = 'primary',
  projectTypes,
  enableProjectTypeFilter,
  className,
}) => {
  const payload = await getPayload({ config: configPromise })

  const where: Where = projectTypes?.length ? { projectType: { in: projectTypes } } : {}
  const query = {
    collection: 'projects' as const,
    overrideAccess: false,
    draft: false,
    where,
    limit: projectsLimit ?? 4,
    sort: '-startDate',
    depth: 1,
  }

  const { docs } = await payload.find(query)

  const projects = docs as Project[]

  if (!projects || projects.length === 0) return null

  const cards = projects.map((project) => {
    const projectPath = getProjectPath(project)

    // 🔽 Kategorie-Label ermitteln
    const categoryLabel = getProjectTypeLabel(project.projectType)

    // 🔽 Kategorie als erster Tag, danach alle regulären Tags
    const tags = [
      ...(categoryLabel ? [categoryLabel] : []),
      ...(project.tags?.map((t) => t.tag).filter(Boolean) ?? []),
    ]

    return {
      projectType: project.projectType,
      enableTeaserLink: Boolean(projectPath),
      link: {
        type: 'custom' as const,
        url: projectPath,
        label: project.title,
      },
      image: project.image ?? null,
      imageHint: project.imageHint ?? null,
      meta: formatProjectDateRange(project.startDate, project.endDate),
      headline: project.title,
      abstract: project.shortDescription,
      tags,
      icon: undefined,
    }
  })

  const projectTypeFilterOptions = Object.entries(projectTypeLabelMap)
    .filter(([value]) => cards.some((card) => card.projectType === value))
    .map(([value, label]) => ({ value, label }))

  const bgClass = backgroundVariant === 'primary' ? 'bg-background' : 'bg-secondary-background'

  return (
    <section className={['py-12 lg:py-24 2xl:py-32', bgClass, className].filter(Boolean).join(' ')}>
      <div className="container flex flex-col gap-6 lg:gap-10">
        {overhead && <p className="overhead">{overhead}</p>}

        {headline && <h2>{highlightPhrase(headline, 'Websites. E-Commerce.')}</h2>}

        {subhead && <p className="subhead big">{subhead}</p>}

        <MasonryGrid
          cards={cards}
          enableProjectTypeFilter={enableProjectTypeFilter ?? false}
          projectTypeFilterOptions={projectTypeFilterOptions}
        />

        {link?.label !== 'no-link' && (
          <CMSLink {...link} appearance="outline" size="lg" label={null} className="mx-auto my-5">
            {link?.label || 'Mehr erfahren'}
            <span className="block bg-accent rounded-full p-1">
              <ArrowUpRight aria-hidden="true" className="stroke-3 text-primary!" />
            </span>
          </CMSLink>
        )}
      </div>
    </section>
  )
}
