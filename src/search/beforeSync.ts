import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'

function buildFullSlugFromBreadcrumbs(originalDoc: any): string | null {
	const breadcrumbs = originalDoc?.breadcrumbs

	if (!Array.isArray(breadcrumbs) || breadcrumbs.length === 0) return null

	// Breadcrumb items enthalten i.d.R. { url, label, ... }
	// url ist meist schon der komplette Pfad (z.B. "/leistungen/dev-ops")
	const last = breadcrumbs[breadcrumbs.length - 1]
	const url = last?.url

	if (typeof url === 'string' && url.length > 0) {
		// "/leistungen/dev-ops" -> "leistungen/dev-ops"
		return url.replace(/^\/+/, '').replace(/\/+$/, '')
	}

	// Fallback, falls kein url vorhanden: über "slug" / "path" / "value" o.ä.
	// (je nach Breadcrumb-Shape in deinem Projekt)
	const parts = breadcrumbs
		.map((b: any) => b?.slug || b?.path || b?.value)
		.filter((v: any) => typeof v === 'string' && v.length > 0)

	return parts.length ? parts.join('/') : null
}

export const beforeSyncWithSearch: BeforeSync = async ({
	req,
	originalDoc,
	searchDoc
}) => {
	const {
		doc: { relationTo: collection }
	} = searchDoc

	const { slug: rawSlug, id, categories, title, meta } = originalDoc as any

	// ✅ Pages: verschachtelten Pfad berücksichtigen
	const slug =
		collection === 'pages'
			? (buildFullSlugFromBreadcrumbs(originalDoc) ?? rawSlug)
			: rawSlug

	const modifiedDoc: DocToSync & {
		clientSlug?: string | null
		shortDescription?: string | null
		projectType?: string | null
		image?: string | null
		tags?: { tag?: string | null }[]
	} = {
		...searchDoc,
		slug,
		meta: {
			...meta,
			title: meta?.title || title,
			image: meta?.image?.id || meta?.image,
			description: meta?.description
		},
		categories: []
	}

	// … dein bestehender Categories-Code bleibt unverändert …

	if (categories && Array.isArray(categories) && categories.length > 0) {
		const populatedCategories: { id: string | number; title: string }[] = []

		for (const category of categories) {
			if (!category) continue

			if (typeof category === 'object') {
				if (category?.id && category?.title) populatedCategories.push(category)
				continue
			}

			const doc = await req.payload.findByID({
				collection: 'categories',
				id: category,
				disableErrors: true,
				depth: 0,
				select: { title: true },
				req
			})

			if (doc !== null) populatedCategories.push(doc as any)
			else {
				console.error(
					`Failed. Category not found when syncing collection '${collection}' with id: '${id}' to search.`
				)
			}
		}

		modifiedDoc.categories = populatedCategories.map((each) => ({
			relationTo: 'categories',
			categoryID: String(each.id),
			title: each.title
		}))
	}

	// ✅ PROJECTS: wie bei dir
	if (collection === 'projects') {
		const { client, shortDescription, projectType, image, tags } =
			originalDoc as any

		modifiedDoc.shortDescription = shortDescription ?? null
		modifiedDoc.projectType = projectType ?? null
		modifiedDoc.image = image?.id || (typeof image === 'string' ? image : null)

		modifiedDoc.tags = Array.isArray(tags)
			? tags
					.map((t: any) => {
						if (!t) return null
						if (typeof t === 'string') return { tag: t }
						return { tag: t?.tag ?? null }
					})
					.filter((t: any): t is { tag: string | null } => t !== null)
			: []

		if (client && typeof client === 'object') {
			modifiedDoc.clientSlug = client.slug ?? null
		} else if (typeof client === 'string') {
			const clientDoc = await req.payload.findByID({
				collection: 'clients',
				id: client,
				disableErrors: true,
				depth: 0,
				select: { slug: true },
				req
			})
			modifiedDoc.clientSlug = (clientDoc as any)?.slug ?? null
		} else {
			modifiedDoc.clientSlug = null
		}
	} else {
		modifiedDoc.clientSlug = null
		modifiedDoc.shortDescription = null
		modifiedDoc.projectType = null
		modifiedDoc.image = null
		modifiedDoc.tags = []
	}

	return modifiedDoc
}
