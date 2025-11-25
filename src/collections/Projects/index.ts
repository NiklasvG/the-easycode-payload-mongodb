import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const Projects: CollectionConfig<'projects'> = {
	slug: 'projects',
	admin: {
		useAsTitle: 'title',
		defaultColumns: ['title', 'slug', 'clients', 'updatedAt']
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
			hasMany: true, // falls es immer nur einen Client geben soll -> false
			required: false
		}
	],
	defaultPopulate: {
		title: true,
		slug: true,
		image: true,
		abstract: true,
		tags: true,
		clients: true
	}
}
