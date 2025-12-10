import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'

import { ClientQuotesBlock } from '@/blocks/ClientQuotes/config'
import { InfoTwoColumnBlock } from '@/blocks/InfoTwoColumn/config'
import { ProjectCtaBlock } from '@/blocks/ProjectCta/config'
import { FAQBlock } from '@/blocks/FAQ/config'
import { Archive } from '@/blocks/ArchiveBlock/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { ClientsSliderBlock } from '@/blocks/ClientsSlider/config'
import { Content } from '@/blocks/Content/config'
import { FormBlock } from '@/blocks/Form/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { ProjectsGridBlock } from '@/blocks/ProjectsGrid/config'
import { ServicesBlock } from '@/blocks/Services/config'

import { hero } from '@/heros/config'

import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import { generatePreviewPath } from '../../utilities/generatePreviewPath'

import {
	MetaDescriptionField,
	MetaImageField,
	MetaTitleField,
	OverviewField,
	PreviewField
} from '@payloadcms/plugin-seo/fields'
import { CollaborationBlock } from '@/blocks/CollaborationBlock/config'

export const Pages: CollectionConfig<'pages'> = {
	slug: 'pages',
	access: {
		create: authenticated,
		delete: authenticated,
		read: authenticatedOrPublished,
		update: authenticated
	},
	// This config controls what's populated by default when a page is referenced
	// https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
	// Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
	defaultPopulate: {
		title: true,
		slug: true,
		breadcrumbs: true
	},
	admin: {
		useAsTitle: 'title',
		defaultColumns: ['title', 'slug', 'updatedAt'],
		livePreview: {
			url: ({ data, req }) =>
				generatePreviewPath({
					slug: data?.slug,
					collection: 'pages',
					req
				})
		},
		preview: (data, { req }) =>
			generatePreviewPath({
				slug: data?.slug as string,
				collection: 'pages',
				req
			})
	},
	fields: [
		{
			name: 'title',
			type: 'text',
			required: true
		},
		{
			type: 'tabs',
			tabs: [
				{
					fields: [hero],
					label: 'Hero'
				},
				{
					fields: [
						{
							name: 'layout',
							type: 'blocks',
							blocks: [
								CallToAction,
								Content,
								MediaBlock,
								Archive,
								FormBlock,
								ClientsSliderBlock,
								ServicesBlock,
								ProjectsGridBlock,
								ClientQuotesBlock,
								InfoTwoColumnBlock,
								ProjectCtaBlock,
								FAQBlock,
								CollaborationBlock
							],
							required: true,
							admin: {
								initCollapsed: true
							}
						}
					],
					label: 'Content'
				},
				{
					name: 'meta',
					label: 'SEO',
					fields: [
						OverviewField({
							titlePath: 'meta.title',
							descriptionPath: 'meta.description',
							imagePath: 'meta.image'
						}),
						MetaTitleField({
							hasGenerateFn: true
						}),
						MetaImageField({
							relationTo: 'media'
						}),

						MetaDescriptionField({}),
						PreviewField({
							// if the `generateUrl` function is configured
							hasGenerateFn: true,

							// field paths to match the target field for data
							titlePath: 'meta.title',
							descriptionPath: 'meta.description'
						})
					]
				}
			]
		},
		{
			name: 'publishedAt',
			type: 'date',
			admin: {
				position: 'sidebar'
			}
		},
		slugField()
	],
	hooks: {
		afterChange: [revalidatePage],
		beforeChange: [populatePublishedAt],
		afterDelete: [revalidateDelete]
	},
	versions: {
		drafts: {
			autosave: {
				interval: 100 // We set this interval for optimal live preview
			},
			schedulePublish: true
		},
		maxPerDoc: 50
	}
}
