// src/collections/Projects/index.ts
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidateProject } from './hooks/revalidateProject'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'

export const Projects: CollectionConfig = {
	slug: 'projects',
	// 1. Versions aktivieren (Drafts)
	versions: {
		drafts: {
			autosave: {
				interval: 100
			},
			schedulePublish: true
		},
		maxPerDoc: 50
	},
	defaultPopulate: {
		title: true,
		slug: true,
		client: true
	},
	admin: {
		useAsTitle: 'title',
		defaultColumns: ['title', 'client', 'industry', 'startDate', '_status'],
		// 2. Live Preview Konfiguration
		livePreview: {
			url: async ({ data, req }) => {
				const path = await generatePreviewPath({
					slug: data?.slug,
					collection: 'projects',
					req,
					data // Wir übergeben data, damit wir an den Client kommen
				})
				return path || ''
			}
		},
		preview: async (data, { req }) => {
			const path = await generatePreviewPath({
				slug: data?.slug as string,
				collection: 'projects',
				req,
				data
			})
			return path || ''
		}
	},
	// 3. Rechte anpassen (Drafts lesen erlauben)
	access: {
		read: authenticatedOrPublished,
		create: authenticated,
		update: authenticated,
		delete: authenticated
	},
	// 4. Cache leeren beim Speichern
	hooks: {
		beforeChange: [populatePublishedAt], // Sorgt dafür, dass publishedAt beim Publishen gesetzt wird
		afterChange: [revalidateProject], // Leert den Cache (Smart: neu & alt)
		afterDelete: [revalidateDelete] // Leert Cache beim Löschen
	},
	fields: [
		{
			type: 'tabs',
			tabs: [
				{
					label: 'Allgemein',
					fields: [
						{
							name: 'title',
							label: 'Projektname',
							type: 'text',
							required: true
						},
						slugField({
							name: 'slug',
							fieldToUse: 'title',
							required: true
						}),
						{
							name: 'shortDescription',
							label: 'Kurzbeschreibung (Card)',
							type: 'textarea',
							required: true,
							admin: {
								description: 'Erscheint auf der Übersichtskarte.'
							}
						},
						{
							name: 'tags',
							label: 'Tags',
							type: 'array',
							labels: {
								singular: 'Tag',
								plural: 'Tags'
							},
							fields: [
								{
									name: 'tag',
									type: 'text',
									label: 'Tag',
									required: true
								}
							]
						},
						{
							type: 'row',
							fields: [
								{
									name: 'client',
									label: 'Verknüpfter Client (Relation)',
									type: 'relationship',
									relationTo: 'clients',
									hasMany: false,
									required: true
								},
								{
									name: 'customer',
									label: 'Endkunde',
									type: 'text',

									admin: {
										width: '50%',
										description: 'Falls abweichend vom verknüpften Client'
									}
								},
								{
									name: 'industry',
									label: 'Branche',
									type: 'text',
									required: true,
									admin: { width: '50%' }
								}
							]
						},
						{
							type: 'row',
							fields: [
								{
									name: 'startDate',
									label: 'Projektstart',
									type: 'date',
									required: true,
									admin: {
										width: '50%'
									}
								},
								{
									name: 'endDate',
									label: 'Projektende',
									type: 'date',
									required: false,
									admin: {
										width: '50%',
										description: 'Leer lassen, wenn noch aktiv.',
										date: { pickerAppearance: 'dayOnly' }
									}
								}
							]
						},
						{
							name: 'demoUrl',
							label: 'Live Demo URL',
							type: 'text'
						},
						{
							name: 'repoUrl',
							label: 'Repository URL',
							type: 'text'
						}
					]
				},
				{
					label: 'Hero & Setup',
					fields: [
						{
							name: 'role',
							label: 'Deine Rolle',
							type: 'text',
							required: true,
							admin: {
								description:
									'z.B. "Konzeption, Frontend, Performance-Optimierung"'
							}
						},
						{
							name: 'outcomeSentence',
							label: 'Ein Satz Ergebnis (Hero)',
							type: 'text',
							required: true,
							admin: {
								description:
									'z.B. "+47 % schnellere Ladezeiten & moderner Markenauftritt"'
							}
						},
						{
							name: 'image',
							label: 'Listenbild (Card)',
							type: 'upload',
							relationTo: 'media',
							required: true
						},
						{
							name: 'heroImage',
							label: 'Hero Bild (Detailseite)',
							type: 'upload',
							relationTo: 'media',
							required: true
						}
					]
				},
				{
					label: 'Case Study',
					fields: [
						{
							name: 'theChallenge',
							label: 'Ausgangslage / Problem',
							type: 'richText',
							editor: lexicalEditor({
								admin: {
									placeholder: 'Type your content here...'
								}
							})
						},
						{
							name: 'theGoal',
							label: 'Ziel',
							type: 'richText',
							editor: lexicalEditor({
								admin: {
									placeholder: 'Type your content here...'
								}
							})
						},
						{
							name: 'theSolution',
							label: 'Lösung / Ansatz',
							type: 'richText',
							editor: lexicalEditor({
								admin: {
									placeholder: 'Type your content here...'
								}
							})
						},
						{
							name: 'theOutcome',
							label: 'Outcome / Impact',
							type: 'richText',
							editor: lexicalEditor({
								admin: {
									placeholder: 'Type your content here...'
								}
							})
						},
						{
							name: 'theNerdDetails',
							label: 'Für Nerds (Tech Deep Dive)',
							type: 'richText',
							editor: lexicalEditor({
								admin: {
									placeholder: 'Type your content here...'
								}
							})
						}
					]
				},
				{
					label: 'Metriken & Tech',
					fields: [
						{
							name: 'stats',
							label: 'Kennzahlen (Stats)',
							type: 'array',
							minRows: 1,
							maxRows: 4,
							fields: [
								{
									type: 'row',
									fields: [
										{
											name: 'value',
											label: 'Wert',
											type: 'text',
											required: true,
											admin: { width: '50%', placeholder: '-95%' }
										},
										{
											name: 'label',
											label: 'Label',
											type: 'text',
											required: true,
											admin: { width: '50%', placeholder: 'Ladezeit reduziert' }
										}
									]
								}
							]
						},
						{
							name: 'technologies',
							label: 'Tech Stack',
							type: 'array',
							fields: [
								{
									name: 'name',
									type: 'text',
									label: 'Technologie'
								}
							]
						},
						{
							name: 'secondaryImages',
							label: 'Weitere Bilder (Features, Vorher/Nachher)',
							type: 'array',
							fields: [
								{
									name: 'image',
									type: 'upload',
									relationTo: 'media'
								}
							]
						},
						{
							name: 'quote',
							label: 'Kundenstimme (Quote)',
							type: 'group',
							fields: [
								{
									name: 'text',
									label: 'Zitat',
									type: 'textarea'
								},
								{
									type: 'row',
									fields: [
										{
											name: 'author',
											label: 'Name',
											type: 'text',
											admin: { width: '50%' }
										},
										{
											name: 'position',
											label: 'Position / Firma',
											type: 'text',
											admin: { width: '50%' }
										}
									]
								}
							]
						}
					]
				}
			]
		}
	]
}
