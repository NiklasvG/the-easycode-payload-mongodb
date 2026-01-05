import { Field } from 'payload'

export const searchFields: Field[] = [
	{
		name: 'slug',
		type: 'text',
		index: true,
		admin: {
			readOnly: true
		}
	},
	{
		name: 'meta',
		label: 'Meta',
		type: 'group',
		index: true,
		admin: {
			readOnly: true
		},
		fields: [
			{
				type: 'text',
				name: 'title',
				label: 'Title'
			},
			{
				type: 'text',
				name: 'description',
				label: 'Description'
			},
			{
				name: 'image',
				label: 'Image',
				type: 'upload',
				relationTo: 'media'
			}
		]
	},
	{
		label: 'Categories',
		name: 'categories',
		type: 'array',
		admin: {
			readOnly: true
		},
		fields: [
			{
				name: 'relationTo',
				type: 'text'
			},
			{
				name: 'categoryID',
				type: 'text'
			},
			{
				name: 'title',
				type: 'text'
			}
		]
	},
	{ name: 'clientSlug', type: 'text', admin: { readOnly: true } },
	{ name: 'shortDescription', type: 'text', admin: { readOnly: true } },
	{ name: 'projectType', type: 'text', admin: { readOnly: true } },
	{
		name: 'image',
		type: 'upload',
		relationTo: 'media',
		admin: { readOnly: true }
	},
	{
		name: 'tags',
		type: 'array',
		admin: { readOnly: true },
		fields: [{ name: 'tag', type: 'text' }]
	}
]
