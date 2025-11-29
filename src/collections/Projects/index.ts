import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const Projects: CollectionConfig = {
	slug: 'projects',
	admin: {
		useAsTitle: 'title',
		defaultColumns: ['title', 'client', 'industry', 'startDate', '_status']
	},
	access: {
		read: () => true,
		create: () => true,
		update: () => true,
		delete: () => true
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
							fieldToUse: 'title'
						}),
						{
							name: 'shortDescription', // Renamed from 'abstract' to match frontend types
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
