import type { Metadata } from 'next'
import { absoluteSEOURL, siteDescription, siteName } from './seo'

const defaultOpenGraph: Metadata['openGraph'] = {
	type: 'website',
	description: siteDescription,
	locale: 'de_DE',
	images: [
		{
			url: absoluteSEOURL('/website-template-OG.webp')
		}
	],
	siteName,
	title: siteName
}

export const mergeOpenGraph = (
	og?: Metadata['openGraph']
): Metadata['openGraph'] => {
	return {
		...defaultOpenGraph,
		...og,
		images: og?.images ? og.images : defaultOpenGraph.images
	}
}
