import type { Metadata } from 'next/types'
import React from 'react'
import Link from 'next/link'

import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'

import { Search } from '@/search/Component'
import PageClient from './page.client'

import MasonryGrid from '@/components/layout/MasonryGrid'
import { ArrowUpRight } from 'lucide-react'

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

type Args = {
	searchParams: Promise<{
		q: string
	}>
}

// Minimaler Typ für Search-Dokumente (nur das was wir hier brauchen)
type SearchDoc = {
	id: string
	title?: string | null
	slug?: string | null
	meta?: {
		title?: string | null
		description?: string | null
		image?: any
	} | null
	doc?: {
		relationTo: 'projects' | 'pages' | 'posts' | 'clients' | string
		value: string
	}
	// Erweiterte Project-Felder im Search-Index:
	clientSlug?: string | null
	shortDescription?: string | null
	projectType?: string | null
	image?: any
	tags?: { tag?: string | null }[] | null
}

function PageTiles({ pages }: { pages: SearchDoc[] }) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{pages.map((p) => {
				const href = p.slug ? `/${p.slug}` : '#'
				const label = p.title || p.meta?.title || 'Seite'

				return (
					<Link
						key={p.id}
						href={href}
						className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:drop-shadow-[0px_4px_30px_rgba(0,173,178,0.25)] duration-300 ease-in-out"
					>
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-lg font-semibold">{label}</p>
								{p.meta?.description && (
									<p className="mt-1 text-sm opacity-70 line-clamp-2">
										{p.meta.description}
									</p>
								)}
							</div>

							<span className="shrink-0 rounded-full bg-accent p-2">
								<ArrowUpRight className="stroke-3 text-primary! size-5" />
							</span>
						</div>
					</Link>
				)
			})}
		</div>
	)
}

export default async function Page({
	searchParams: searchParamsPromise
}: Args) {
	const { q: query } = await searchParamsPromise
	const payload = await getPayload({ config: configPromise })

	// ✅ typsicherer OR-Block
	const queryOr: Where | null = query
		? {
				or: [
					{ title: { like: query } },
					{ 'meta.description': { like: query } },
					{ 'meta.title': { like: query } },
					{ slug: { like: query } }
				]
			}
		: null

	// ✅ typsicherer WHERE für projects/pages
	const projectsWhere: Where = {
		and: [
			{ 'doc.relationTo': { equals: 'projects' } },
			...(queryOr ? [queryOr] : [])
		]
	}

	const pagesWhere: Where = {
		and: [
			{ 'doc.relationTo': { equals: 'pages' } },
			...(queryOr ? [queryOr] : [])
		]
	}

	// ─────────────────────────────────────────────────────────────
	// 1) PROJECTS direkt aus SEARCH (ohne IDs)
	// ─────────────────────────────────────────────────────────────
	const projectsSearch = await payload.find({
		collection: 'search',
		depth: 2,
		limit: 4,
		pagination: false,
		select: {
			doc: true,
			title: true,
			slug: true,
			meta: true,

			clientSlug: true,
			shortDescription: true,
			projectType: true,
			image: true,
			tags: true
		},
		where: projectsWhere
	})

	const projectDocs = (projectsSearch.docs ?? []) as SearchDoc[]

	const projectCards = projectDocs
		.filter((d) => Boolean(d.slug))
		.map((d) => {
			const categoryLabel = getProjectTypeLabel(d.projectType ?? null)

			const tags = [
				...(categoryLabel ? [categoryLabel] : []),
				...((d.tags ?? []).map((t) => t?.tag).filter(Boolean) as string[])
			]

			const clientSlug = d.clientSlug ?? 'client'

			return {
				enableTeaserLink: true,
				link: {
					type: 'custom' as const,
					url: `/projekte/${clientSlug}/${d.slug}`,
					label: d.title ?? d.meta?.title ?? d.slug ?? 'Projekt'
				},
				image: d.image ?? d.meta?.image ?? null,
				headline: d.title ?? d.meta?.title ?? '',
				abstract: d.shortDescription ?? d.meta?.description ?? '',
				tags,
				icon: undefined
			}
		})

	// ─────────────────────────────────────────────────────────────
	// 2) PAGES direkt aus SEARCH als Kacheln
	// ─────────────────────────────────────────────────────────────
	const pagesSearch = await payload.find({
		collection: 'search',
		depth: 0,
		limit: 6,
		pagination: false,
		select: {
			doc: true,
			title: true,
			slug: true,
			meta: true
		},
		where: pagesWhere
	})

	console.log('pagesSearch', pagesSearch)

	const pageDocs = (pagesSearch.docs ?? []) as SearchDoc[]

	// ─────────────────────────────────────────────────────────────
	// 3) Render
	// ─────────────────────────────────────────────────────────────
	const hasAnyResults = projectCards.length > 0 || pageDocs.length > 0

	return (
		<div className="pt-24 pb-24">
			<PageClient />

			<div className="container mb-16">
				<div className="prose dark:prose-invert max-w-none text-center">
					<div className="mb-12 text-center">
						<h1 className="mb-8 lg:mb-16 h1 font-semibold">Suche</h1>
						<div className="max-w-[50rem] mx-auto">
							<Search />
						</div>
					</div>
				</div>
			</div>

			{/* PAGES */}
			{pageDocs.length > 0 && (
				<div className="container mt-126">
					<h2 className="mb-6 text-5xl">Seiten</h2>
					<PageTiles pages={pageDocs} />
				</div>
			)}

			{/* PROJECTS */}
			{projectCards.length > 0 && (
				<div className="container mt-16">
					<h2 className="mb-6 text-5xl">Projekte</h2>
					<MasonryGrid cards={projectCards} />
				</div>
			)}

			{!hasAnyResults && (
				<div className="container mt-12 big">Keine Ergebnisse gefunden.</div>
			)}
		</div>
	)
}

export function generateMetadata(): Metadata {
	return {
		title: `The-EasyCode | Suche`
	}
}
