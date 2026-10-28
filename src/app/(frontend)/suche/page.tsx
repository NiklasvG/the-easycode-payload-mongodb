import { connection } from 'next/server'
import type { Metadata } from 'next/types'
import React from 'react'
import Link from 'next/link'

import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'

import { Search } from '@/search/Component'
import type { Media } from '@/payload-types'
import PageClient from './page.client'

import MasonryGrid from '@/components/layout/MasonryGrid'
import { ArrowUpRight } from 'lucide-react'

import { getProjectTypeLabel, formatProjectDateRange } from '@/utilities/projectPresentation'

type Args = {
  searchParams: Promise<{
    q?: string | string[]
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
    image?: Media | string | null
  } | null
  doc?: {
    relationTo: 'projects' | 'pages' | 'posts' | 'clients' | string
    value: string
  }
  // Erweiterte Project-Felder im Search-Index:
  clientSlug?: string | null
  shortDescription?: string | null
  projectType?: string | null
  imageHint?: string | null
  startDate?: string | null
  endDate?: string | null
  image?: Media | string | null
  tags?: { tag?: string | null }[] | null
}

function PageTiles({ pages }: { pages: SearchDoc[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pages.map((p) => {
        const href = p.slug === 'home' || p.slug === '' ? '/' : `/${p.slug}`
        const label = p.title || p.meta?.title || 'Seite'

        return (
          <Link
            key={p.id}
            href={href}
            className="group min-w-0 rounded-2xl border border-white/20 bg-card p-5 transition-colors duration-150 hover:border-accent focus-visible:border-accent [overflow-wrap:anywhere]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg! leading-snug! font-semibold">{label}</h3>
                {p.meta?.description && (
                  <p className="mt-1 text-sm opacity-70 line-clamp-2">{p.meta.description}</p>
                )}
              </div>

              <span className="shrink-0 rounded-full bg-accent p-2">
                <ArrowUpRight className="stroke-3 text-white size-5" aria-hidden="true" />
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q } = await searchParamsPromise
  const query = (typeof q === 'string' ? q : '').trim().slice(0, 200)
  await connection()
  const payload = await getPayload({ config: configPromise })

  // ✅ typsicherer OR-Block
  const queryOr: Where | null = query
    ? {
        or: [
          { title: { like: query } },
          { 'meta.description': { like: query } },
          { 'meta.title': { like: query } },
          { slug: { like: query } },
        ],
      }
    : null

  // ✅ typsicherer WHERE für projects/pages
  const projectsWhere: Where = {
    and: [{ 'doc.relationTo': { equals: 'projects' } }, ...(queryOr ? [queryOr] : [])],
  }

  const pagesWhere: Where = {
    and: [{ 'doc.relationTo': { equals: 'pages' } }, ...(queryOr ? [queryOr] : [])],
  }

  // ─────────────────────────────────────────────────────────────
  // 1) PROJECTS direkt aus SEARCH (ohne IDs)
  // ─────────────────────────────────────────────────────────────
  const projectsSearch = await payload.find({
    collection: 'search',
    overrideAccess: false,
    depth: 2,
    limit: 24,
    pagination: false,
    select: {
      doc: true,
      title: true,
      slug: true,
      meta: true,

      clientSlug: true,
      shortDescription: true,
      projectType: true,
      imageHint: true,
      startDate: true,
      endDate: true,
      image: true,
      tags: true,
    },
    where: projectsWhere,
  })

  const projectDocs = (projectsSearch.docs ?? []) as SearchDoc[]

  const projectCards = projectDocs
    .filter((d) => Boolean(d.slug && d.clientSlug))
    .map((d) => {
      const categoryLabel = getProjectTypeLabel(d.projectType ?? null)

      const tags = [
        ...(categoryLabel ? [categoryLabel] : []),
        ...((d.tags ?? []).map((t) => t?.tag).filter(Boolean) as string[]),
      ]

      const clientSlug = d.clientSlug!

      return {
        enableTeaserLink: true,
        link: {
          type: 'custom' as const,
          url: `/projekte/${encodeURIComponent(clientSlug)}/${encodeURIComponent(d.slug!)}`,
          label: d.title ?? d.meta?.title ?? d.slug ?? 'Projekt',
        },
        image: d.image ?? d.meta?.image ?? null,
        imageHint: d.imageHint ?? null,
        meta: formatProjectDateRange(d.startDate, d.endDate),
        headline: d.title ?? d.meta?.title ?? '',
        abstract: d.shortDescription ?? d.meta?.description ?? '',
        tags,
        icon: undefined,
      }
    })

  // ─────────────────────────────────────────────────────────────
  // 2) PAGES direkt aus SEARCH als Kacheln
  // ─────────────────────────────────────────────────────────────
  const pagesSearch = await payload.find({
    collection: 'search',
    overrideAccess: false,
    depth: 0,
    limit: 24,
    pagination: false,
    select: {
      doc: true,
      title: true,
      slug: true,
      meta: true,
    },
    where: pagesWhere,
  })

  const pageDocs = ((pagesSearch.docs ?? []) as SearchDoc[]).filter(
    (doc) => typeof doc.slug === 'string',
  )

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
            <div className="max-w-200 mx-auto">
              <Search />
            </div>
          </div>
        </div>
      </div>

      <p role="status" className="container mb-8 text-muted-foreground">
        {query ? `Suchergebnisse für „${query}“: ` : 'Inhalte entdecken: '}
        {pageDocs.length} Seiten und {projectCards.length} Projekte
      </p>
      {(projectsSearch.totalDocs > projectCards.length ||
        pagesSearch.totalDocs > pageDocs.length) && (
        <p className="container mb-8">
          Weitere Treffer vorhanden. Grenze deine Suche mit einem genaueren Begriff ein.
        </p>
      )}

      {/* PAGES */}
      {pageDocs.length > 0 && (
        <div className="container">
          <h2 className="mb-6 text-3xl! sm:text-4xl!">Seiten</h2>
          <PageTiles pages={pageDocs} />
        </div>
      )}

      {/* PROJECTS */}
      {projectCards.length > 0 && (
        <div className="container mt-16">
          <h2 className="mb-6 text-3xl! sm:text-4xl!">Projekte</h2>
          <MasonryGrid cards={projectCards} />
        </div>
      )}

      {!hasAnyResults && (
        <div className="container mt-12 big">
          <h2 className="text-2xl! mb-4">Keine Ergebnisse gefunden</h2>
          <p>Versuche einen anderen oder kürzeren Suchbegriff.</p>
          <Link
            href="/leistungen"
            className="inline-flex min-h-11 items-center mt-4 text-accent underline underline-offset-4"
          >
            Leistungen entdecken
          </Link>
        </div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Suche | The-EasyCode',
    robots: { index: false, follow: true },
  }
}
