import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const Clients: CollectionConfig<'clients'> = {
	slug: 'clients',
	admin: {
		useAsTitle: 'companyName',
		defaultColumns: ['companyName', 'slug', 'logo', 'updatedAt']
	},
	access: {
		read: () => true,
		create: () => true,
		update: () => true,
		delete: () => true
	},
	fields: [
		{
			name: 'companyName',
			label: 'Firmenname',
			type: 'text',
			required: true
		},
		slugField({
			name: 'slug',
			fieldToUse: 'companyName'
		}),
		{
			name: 'logo',
			label: 'Firmenlogo',
			type: 'upload',
			relationTo: 'media', // deine Media-Collection
			required: false
		},
		{
			name: 'contacts',
			label: 'Kontaktpersonen',
			type: 'array',
			labels: {
				singular: 'Kontaktperson',
				plural: 'Kontaktpersonen'
			},
			fields: [
				{
					name: 'name',
					label: 'Name',
					type: 'text',
					required: true
				},
				{
					name: 'position',
					label: 'Position',
					type: 'text',
					required: false
				},
				{
					name: 'image',
					label: 'Bild',
					type: 'upload',
					relationTo: 'media',
					required: false
				},
				{
					name: 'comment',
					label: 'Kommentar über die Zusammenarbeit',
					type: 'textarea',
					required: false
				}
			]
		}
	],
	defaultPopulate: {
		companyName: true,
		slug: true,
		logo: true,
		contacts: true
	}
}
