import type {
	CollectionAfterChangeHook,
	CollectionAfterDeleteHook
} from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'
import type { Project, Client } from '@/payload-types' // Pfad zu deinen generierten Types anpassen

// Hilfsfunktion, um den Pfad zu bauen
const getProjectPath = async (
	projectDoc: Project,
	payload: any
): Promise<string> => {
	let clientSlug = ''

	if (projectDoc.client) {
		if (typeof projectDoc.client === 'object' && 'slug' in projectDoc.client) {
			clientSlug = projectDoc.client.slug as string
		} else if (
			typeof projectDoc.client === 'string' ||
			typeof projectDoc.client === 'number'
		) {
			// Wenn Client nur eine ID ist, müssen wir fetchen
			const client = await payload.findByID({
				collection: 'clients',
				id: projectDoc.client,
				depth: 0
			})
			clientSlug = client.slug
		}
	}

	if (!clientSlug) return ''
	return `/projekte/${clientSlug}/${projectDoc.slug}`
}

export const revalidateProject: CollectionAfterChangeHook<Project> = async ({
	doc,
	previousDoc,
	req: { payload, context }
}) => {
	if (!context.disableRevalidate) {
		// 1. Revalidate Current Doc (wenn published)
		if (doc._status === 'published') {
			const path = await getProjectPath(doc, payload)
			if (path) {
				payload.logger.info(`Revalidating project at path: ${path}`)
				revalidatePath(path)
			}
			// Immer die Übersicht und Sitemap revalidieren
			revalidatePath('/projekte')
			revalidateTag('projects-sitemap')
		}

		// 2. Revalidate Previous Doc (wenn sich Slug/Client geändert hat oder un-published wurde)
		// Wir prüfen, ob previousDoc existiert und ob es published war
		if (
			previousDoc?._status === 'published' &&
			(doc._status !== 'published' ||
				doc.slug !== previousDoc.slug ||
				doc.client !== previousDoc.client)
		) {
			const oldPath = await getProjectPath(previousDoc, payload)
			if (oldPath) {
				payload.logger.info(`Revalidating old project path: ${oldPath}`)
				revalidatePath(oldPath)
			}
			revalidatePath('/projekte')
			revalidateTag('projects-sitemap')
		}
	}
	return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Project> = async ({
	doc,
	req: { payload, context }
}) => {
	if (!context.disableRevalidate) {
		const path = await getProjectPath(doc, payload)
		if (path) {
			revalidatePath(path)
		}
		revalidatePath('/projekte')
		revalidateTag('projects-sitemap')
	}
	return doc
}
