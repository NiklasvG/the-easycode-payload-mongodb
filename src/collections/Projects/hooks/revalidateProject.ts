// src/collections/Projects/hooks/revalidateProject.ts
import type { CollectionAfterChangeHook } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidateProject: CollectionAfterChangeHook = async ({
	doc,
	req: { payload }
}) => {
	if (doc._status === 'published') {
		let clientSlug = ''

		// Client Slug ermitteln (ID oder Objekt)
		if (typeof doc.client === 'string') {
			const client = await payload.findByID({
				collection: 'clients',
				id: doc.client,
				depth: 0
			})
			clientSlug = client.slug
		} else if (doc.client?.slug) {
			clientSlug = doc.client.slug
		}

		if (clientSlug) {
			const path = `/projekte/${clientSlug}/${doc.slug}`
			payload.logger.info(`Revalidating project at path: ${path}`)
			revalidatePath(path)
			revalidatePath('/projekte') // Übersichtsseite auch aktualisieren
		}
	}

	return doc
}
