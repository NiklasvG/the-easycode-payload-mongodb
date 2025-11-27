import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const Projects: CollectionConfig<'projects'> = {
	slug: 'projects',
	admin: {
		useAsTitle: 'title',
		defaultColumns: ['title', 'slug', 'clients', 'startDate', 'updatedAt']
	},
	access: {
		read: () => true,
		create: () => true,
		update: () => true,
		delete: () => true
	},
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
			name: 'image',
			label: 'Projektbild',
			type: 'upload',
			relationTo: 'media',
			required: true
		},

		// 🔹 Start- und Enddatum
		{
			name: 'startDate',
			label: 'Projektstart',
			type: 'date',
			required: true,
			admin: {
				description: 'Start des Projekts (z. B. Kick-off, Projektbeginn).',
				date: {
					pickerAppearance: 'dayOnly'
				}
			}
		},
		{
			name: 'endDate',
			label: 'Projektende',
			type: 'date',
			required: false,
			admin: {
				description:
					'Optional, falls das Projekt abgeschlossen ist – sonst leer lassen.',
				date: {
					pickerAppearance: 'dayOnly'
				}
			}
		},

		{
			name: 'abstract',
			label: 'Kurzbeschreibung',
			type: 'textarea',
			required: true
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
			name: 'clients',
			label: 'Client(s)',
			type: 'relationship',
			relationTo: 'clients',
			hasMany: true,
			required: false,
			admin: {
				description:
					'Direkte Auftraggeber (z. B. Agentur queo, mit der du zusammenarbeitest).'
			}
		},

		// 🔹 Endkunde / Marke, für die das Projekt eigentlich ist (BMW etc.)
		{
			name: 'endCustomer',
			label: 'Endkunde / Marke',
			type: 'group',
			admin: {
				description:
					'Optional: Firma/Marke, für die das Projekt letztlich umgesetzt wurde (z. B. Auftraggeber: queo, Endkunde: BMW).'
			},
			fields: [
				{
					name: 'name',
					label: 'Name des Endkunden',
					type: 'text',
					required: false
				},
				{
					name: 'website',
					label: 'Website des Endkunden',
					type: 'text',
					required: false
				}
			]
		}
	],
	defaultPopulate: {
		title: true,
		slug: true,
		image: true,
		abstract: true,
		tags: true,
		clients: true,
		startDate: true,
		endDate: true,
		endCustomer: true
	}
}
