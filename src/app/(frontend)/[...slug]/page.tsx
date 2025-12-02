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

// Helper um Params korrekt zu typisieren
type Args = {
	params: Promise<{
		slug?: string[] // WICHTIG: slug ist jetzt ein Array!
	}>
}

export async function generateStaticParams() {
	const payload = await getPayload({ config: configPromise })
	const pages = await payload.find({
		collection: 'pages',
		draft: false,
		limit: 1000,
		overrideAccess: false,
		pagination: false,
		select: {
			slug: true,
			breadcrumbs: true // Wir brauchen die Breadcrumbs für den vollen Pfad
		}
	})

	const params = pages.docs
		?.filter((doc) => {
			return doc.slug !== 'home'
		})
		.map(({ breadcrumbs }) => {
			// Wir nehmen die URL vom letzten Breadcrumb, da dieser den vollen Pfad enthält
			const url = breadcrumbs?.[breadcrumbs.length - 1]?.url
			if (!url) return null

			// Entferne führenden Slash und splitte in Segmente
			const slug = url.replace(/^\/|\/$/g, '').split('/')

			return { slug }
		})
		.filter(Boolean)

	return params || []
}

export default async function Page({ params: paramsPromise }: Args) {
	const { isEnabled: draft } = await draftMode()
	const { slug = ['home'] } = await paramsPromise

	// 1. URL aus Params rekonstruieren (z.B. "/leistungen/web-entwicklung")
	const urlPath = '/' + slug.join('/')

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
	if (page.breadcrumbs && page.breadcrumbs.length > 0) {
		const correctURL = page.breadcrumbs[page.breadcrumbs.length - 1]?.url

		// Wenn die aufgerufene URL (urlPath) nicht der korrekten URL entspricht -> Redirect
		if (correctURL && correctURL !== urlPath) {
			permanentRedirect(correctURL)
		}
	}

	const { hero, layout } = page

	return (
		<article>
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

	return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
	const { isEnabled: draft } = await draftMode()

	const payload = await getPayload({ config: configPromise })

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
