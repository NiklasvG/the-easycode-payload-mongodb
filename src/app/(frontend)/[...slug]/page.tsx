import LoadingContent from '../loading'
import { connection } from 'next/server'
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

// Helper um Params korrekt zu typisieren
type Args = {
	params: Promise<{
		slug?: string[] // WICHTIG: slug ist jetzt ein Array!
	}>
}


export default function Page(props: Args) {
  return <React.Suspense fallback={<LoadingContent />}><PageContent {...props} /></React.Suspense>
}

async function PageContent({ params: paramsPromise }: Args) {
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
		return <React.Suspense fallback={<LoadingContent />}><PayloadRedirects url={urlPath} /></React.Suspense>
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
			<React.Suspense fallback={null}><PayloadRedirects disableNotFound url={urlPath} /></React.Suspense>

			{draft && <LivePreviewListener />}

			<RenderHero {...hero} />
			<React.Suspense fallback={<LoadingContent />}><RenderBlocks blocks={layout} /></React.Suspense>
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
	await connection()
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
