import { link } from '@/fields/link'

import type { Block } from 'payload'

export const ServicesBlock: Block = {
	slug: 'services',
	interfaceName: 'ServicesBlock',
	labels: {
		singular: 'Services',
		plural: 'Services'
	},
	fields: [
		{
			name: 'backgroundVariant',
			type: 'select',
			label: 'Hintergrund',
			required: true,
			defaultValue: 'secondary',
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
			name: 'overhead',
			type: 'text',
			label: 'Overhead (kleine Überschrift)',
			required: false,
			defaultValue: 'Leistungen'
		},
		{
			name: 'headline',
			type: 'text',
			label: 'Überschrift',
			required: false,
			defaultValue: 'Zielgerichtet. Maßgeschneidert. Flexibel.'
		},
		{
			name: 'accentText',
			type: 'text',
			label: 'Akzentwort (optional, farbig)',
			required: false,
			defaultValue: 'Maßgeschneidert.'
		},
		{
			name: 'subhead',
			type: 'textarea',
			label: 'Subheadline',
			required: false,
			defaultValue:
				'Von der Konzeption bis zum Live-Gang: Digitale Projekte, die ins Schwarze treffen.'
		},
		{
			name: 'enableLink',
			type: 'checkbox'
		},
		link({
			appearances: false,
			overrides: {
				admin: {
					condition: (_data, siblingData) => {
						return Boolean(siblingData?.enableLink)
					}
				},
				label: 'CTA-Link'
			}
		}),
		{
			name: 'services',
			type: 'array',
			label: 'Service-Teaser',
			labels: {
				singular: 'Service',
				plural: 'Services'
			},
			required: true,
			fields: [
				{
					name: 'enableTeaserLink',
					type: 'checkbox'
				},
				link({
					appearances: false,
					overrides: {
						admin: {
							condition: (_data, siblingData) => {
								return Boolean(siblingData?.enableTeaserLink)
							}
						}
					}
				}),
				{
					name: 'icon',
					type: 'select',
					label: 'Icon',
					required: false,
					options: [
						{ label: 'Computer', value: 'computer' },
						{ label: 'Cloud', value: 'cloud' },
						{ label: 'Apple', value: 'apple' },
						{ label: 'Cart', value: 'cart' },
						{ label: 'Pen', value: 'pen' },
						{ label: 'Engagement', value: 'engagement' },
						{ label: 'Code', value: 'code' },
						{ label: 'Clock', value: 'clock' },
						{ label: 'Applause', value: 'applause' }
					]
				},
				{
					name: 'image',
					type: 'upload',
					relationTo: 'media',
					label: 'Bild (optional statt Icon)',
					required: false
				},
				{
					name: 'headline',
					type: 'text',
					label: 'Titel',
					required: true
				},
				{
					name: 'abstract',
					type: 'textarea',
					label: 'Kurzbeschreibung',
					required: true
				},

				{
					name: 'items',
					type: 'array',
					label: 'Listenpunkte',
					labels: {
						singular: 'Listenpunkt',
						plural: 'Listenpunkte'
					},
					minRows: 0,
					fields: [
						{
							name: 'text',
							type: 'text',
							label: 'Text',
							required: true
						}
					]
				},
				{
					name: 'border',
					type: 'checkbox',
					label: 'Rand anzeigen',
					defaultValue: true
				},
				{
					name: 'tags',
					type: 'array',
					label: 'Tags',
					fields: [
						{
							name: 'tag',
							type: 'text',
							label: 'Tag'
						}
					]
				}
			]
		}
	]
}
