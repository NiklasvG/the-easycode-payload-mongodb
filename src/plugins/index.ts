import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import {
	FixedToolbarFeature,
	HeadingFeature,
	lexicalEditor
} from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post, Project } from '@/payload-types'
import { absoluteSEOURL, getSEOTitle } from '@/utilities/seo'
import { getContentPath } from '@/utilities/generateMeta'
import { authenticated } from '@/access/authenticated'
import { validateFormSubmission } from '@/hooks/validateFormSubmission'

const generateTitle: GenerateTitle<Post | Page | Project> = ({ doc }) => {
	return getSEOTitle(doc?.title)
}

const generateURL: GenerateURL<Post | Page | Project> = async ({ doc, collectionSlug, req }) => {
  const collection = collectionSlug === 'posts' || collectionSlug === 'projects' ? collectionSlug : 'pages'
  let resolved = doc
  if (collection === 'projects' && 'client' in doc && typeof doc.client === 'string') {
    const client = await req.payload.findByID({ collection: 'clients', id: doc.client, depth: 0, overrideAccess: false, req })
    resolved = { ...doc, client }
  }
  return absoluteSEOURL(getContentPath(resolved, collection))
}

export const plugins: Plugin[] = [
	redirectsPlugin({
		collections: ['pages', 'posts'],
		overrides: {
			access: { read: () => true, create: authenticated, update: authenticated, delete: authenticated },
			// @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
			fields: ({ defaultFields }) => {
				return defaultFields.map((field) => {
					if ('name' in field && field.name === 'from') {
						return {
							...field,
							admin: {
								description:
									'Änderungen werden beim nächsten Seitenaufruf berücksichtigt.'
							}
						}
					}
					return field
				})
			},
			hooks: {
				afterChange: [revalidateRedirects],
                afterDelete: [revalidateRedirects]
			}
		}
	}),
	nestedDocsPlugin({
		collections: ['categories', 'pages'],
		generateLabel: (_, doc) => (doc.title as string) || '',
		generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, '')
	}),
	seoPlugin({
		generateTitle,
		generateURL
	}),
	formBuilderPlugin({
		fields: {
			payment: false
		},
		formOverrides: {
			access: { read: () => true, create: authenticated, update: authenticated, delete: authenticated },
			fields: ({ defaultFields }) => {
				return defaultFields.map((field) => {
					if ('name' in field && field.name === 'emails' && field.type === 'array') return { ...field, access: { ...field.access, read: ({ req }) => Boolean(req.user) } }
					// Editor-Override für confirmationMessage beibehalten
					if ('name' in field && field.name === 'confirmationMessage') {
						return {
							...field,
							editor: lexicalEditor({
								features: ({ rootFeatures }) => {
									return [
										...rootFeatures,
										FixedToolbarFeature(),
										HeadingFeature({
											enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4']
										})
									]
								}
							})
						}
					}

					// Placeholder zu relevanten Block-Typen hinzufügen
					if (
						'name' in field &&
						field.name === 'fields' &&
						'type' in field &&
						field.type === 'blocks'
					) {
						const blocks = field.blocks?.map((block) => {
							if (
								['text', 'number', 'email', 'textarea'].includes(block.slug)
							) {
								return {
									...block,
									fields: [
										...block.fields,
										{
											name: 'placeholder',
											type: 'text' as const,
											label: 'Placeholder',
											required: false
										}
									]
								}
							}
							return block
						})

						return { ...field, blocks }
					}

					return field
				})
			}
		},
		formSubmissionOverrides: {
			access: { create: () => true, read: authenticated, update: () => false, delete: authenticated },
			hooks: { beforeValidate: [validateFormSubmission] },
		},
	}),
	searchPlugin({
		collections: ['posts', 'projects', 'clients', 'pages'],
		beforeSync: beforeSyncWithSearch,
		syncDrafts: false,
		deleteDrafts: true,
		searchOverrides: {
			access: { read: () => true, create: authenticated, update: authenticated, delete: authenticated },
			fields: ({ defaultFields }) => {
				return [...defaultFields, ...searchFields]
			}
		}
	})
]

