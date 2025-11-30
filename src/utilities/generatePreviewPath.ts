// src\utilities\generatePreviewPath.ts
import { PayloadRequest, CollectionSlug } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
	posts: '/posts',
	pages: ''
	// projects wird hier dynamisch behandelt, daher nicht in der Map nötig
}

type Props = {
	collection: CollectionSlug
	slug: string
	req: PayloadRequest
	data?: any // Neu: Wir brauchen die Daten des Dokuments
}

export const generatePreviewPath = async ({
	collection,
	slug,
	req,
	data
}: Props) => {
	if (!slug) {
		return null
	}

	const encodedSlug = encodeURIComponent(slug)
	let path = ''

	// Spezifische Logik für Projects
	if (collection === 'projects') {
		let clientSlug = ''

		// Fall 1: Client ist bereits im Objekt populated (z.B. durch afterRead)
		if (
			data?.client &&
			typeof data.client === 'object' &&
			'slug' in data.client
		) {
			clientSlug = data.client.slug
		}
		// Fall 2: Client ist nur eine ID -> Wir müssen fetchen
		else if (data?.client) {
			try {
				const clientDoc = await req.payload.findByID({
					collection: 'clients',
					id: data.client,
					depth: 0
				})
				clientSlug = clientDoc.slug
			} catch (error) {
				// Fallback oder Error Logging
				console.error('Could not fetch client for preview path', error)
			}
		}

		// Wenn wir einen Client Slug haben, bauen wir den Pfad
		if (clientSlug) {
			path = `/projekte/${clientSlug}/${encodedSlug}`
		} else {
			// Fallback, falls noch kein Client gewählt wurde
			return null
		}
	}
	// Standard Logik für Pages, Posts, etc.
	else if (collectionPrefixMap[collection] !== undefined) {
		path = `${collectionPrefixMap[collection]}/${encodedSlug}`
	} else {
		// Wenn Collection nicht bekannt, kein Preview
		return null
	}

	const encodedParams = new URLSearchParams({
		slug: encodedSlug,
		collection,
		path, // Der entscheidende Parameter für deine route.ts
		previewSecret: process.env.PREVIEW_SECRET || ''
	})

	return `/next/preview?${encodedParams.toString()}`
}
