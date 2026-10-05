// src/app/(frontend)/[...slug]/page.tsx
import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { permanentRedirect } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getPreviewAccess } from '@/utilities/getPreviewAccess'
import { getPagePath } from '@/utilities/contentPaths'
import { StructuredData } from '@/components/StructuredData'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { getContentBreadcrumbs, getContentStructuredData } from '@/utilities/structuredData'

// Helper um Params korrekt zu typisieren
type Args = {
	params: Promise<{
		slug?: string[] // WICHTIG: slug ist jetzt ein Array!
	}>
}


export default async function Page({ params: paramsPromise }: Args) {
	const { isEnabled: draft } = await draftMode()
	const { slug: requestedSlug } = await paramsPromise
	const slug = requestedSlug?.length ? requestedSlug : ['home']

	// 1. URL aus Params rekonstruieren (z.B. "/leistungen/web-entwicklung")
	const urlPath = requestedSlug?.length ? '/' + requestedSlug.join('/') : '/'

	// 2. Letztes Segment für DB-Suche nutzen
	const lastSegment = slug[slug.length - 1]
	const decodedSlug = decodeURIComponent(lastSegment)

	const page = await queryPageBySlug({
		slug: decodedSlug
	})

	if (!page) {
		return <PayloadRedirects url={urlPath} />
	}

	// Wir prüfen, ob die Seite Breadcrumbs hat und ob die URL übereinstimmt.
	// Das nestedDocs Plugin speichert die volle URL im letzten Breadcrumb.
	const correctURL = getPagePath(page)
	if (correctURL !== urlPath) permanentRedirect(correctURL)

	const { hero, layout } = page

	return (
		<article>
			{!draft && <StructuredData data={getContentStructuredData(page, 'pages')} />}
			<Breadcrumbs items={getContentBreadcrumbs(page, 'pages')} />
			<PageClient />
			<PayloadRedirects disableNotFound url={urlPath} />

			{draft && <LivePreviewListener />}

			<RenderHero {...hero} />
			<RenderBlocks blocks={layout} />
		</article>
	)
}

export async function generateMetadata({
	params: paramsPromise
}: Args): Promise<Metadata> {
	const { slug = ['home'] } = await paramsPromise
	const lastSegment = slug[slug.length - 1]
	const decodedSlug = decodeURIComponent(lastSegment)

	const page = await queryPageBySlug({
		slug: decodedSlug
	})

	const { isEnabled: preview } = await draftMode()
	return generateMeta({ doc: page, preview })
}

export async function generateStaticParams() {
	const payload = await getPayload({ config: configPromise })
	const { docs } = await payload.find({
		collection: 'pages',
		draft: false,
		overrideAccess: false,
		pagination: false,
		depth: 0,
		where: { _status: { equals: 'published' } },
		select: { slug: true, breadcrumbs: true },
	})

	return docs.filter((page) => page.slug !== 'home').map((page) => ({
		slug: getPagePath(page).split('/').filter(Boolean).map(decodeURIComponent),
	}))
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
	const payload = await getPayload({ config: configPromise })
	const draft = await getPreviewAccess(payload)

	const result = await payload.find({
		collection: 'pages',
		draft,
		limit: 1,
		pagination: false,
		overrideAccess: draft,
		where: {
			slug: {
				equals: slug
			}
		}
	})

	return result.docs?.[0] || null
})
