// src/payload/blocks/CollaborationBlock.ts
import type { Block } from 'payload'
// Falls du ein zentrales link()-Field hast:
import { link } from '@/fields/link'

export const CollaborationBlock: Block = {
	slug: 'collaboration',
	interfaceName: 'CollaborationBlock',
	labels: {
		singular: 'Collaboration',
		plural: 'Collaborations'
	},
	fields: [
		{
			name: 'backgroundVariant',
			type: 'select',
			label: 'Hintergrund',
			required: true,
			defaultValue: 'primary',
			options: [
				{
					label: 'Primär (bg-background)',
					value: 'primary'
				},
				{
					label: 'Sekundär (bg-secondary-background)',
					value: 'secondary'
				}
			]
		},
		{
			name: 'title',
			type: 'text',
			label: 'Überschrift',
			required: true
		},
		{
			name: 'items',
			type: 'array',
			label: 'Bullet Points',
			labels: {
				singular: 'Bullet Point',
				plural: 'Bullet Points'
			},
			minRows: 1,
			maxRows: 10,
			fields: [
				{
					name: 'title',
					type: 'text',
					label: 'Titel',
					required: true
				},
				{
					name: 'description',
					type: 'textarea',
					label: 'Beschreibung (optional)'
				}
			]
		},
		{
			name: 'sideDescription',
			type: 'textarea',
			label: 'Text rechts (unter den Icons)'
		},
		{
			name: 'enableLink',
			type: 'checkbox'
		},
		link({
			overrides: {
				admin: {
					condition: (_data, siblingData) => {
						return Boolean(siblingData?.enableLink)
					}
				}
			}
		})
	]
}
