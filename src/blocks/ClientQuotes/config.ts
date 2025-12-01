import type { Block } from 'payload'

export const ClientQuotesBlock: Block = {
	slug: 'clientQuotes',
	interfaceName: 'ClientQuotesBlock',
	labels: {
		singular: 'Client-Quote Slider',
		plural: 'Client-Quote Slider'
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
			name: 'overhead',
			type: 'text',
			label: 'Overhead (kleine Überschrift)',
			required: false,
			defaultValue: 'Stimmen unserer Kunden'
		},
		{
			name: 'headline',
			type: 'text',
			label: 'Überschrift',
			required: false,
			defaultValue: 'Was unsere Kund:innen über uns sagen'
		},
		{
			name: 'subhead',
			type: 'text',
			label: 'Subheadline',
			required: false,
			defaultValue:
				'Echte Zitate von Ansprechpartner:innen aus erfolgreichen Projekten.'
		},
		{
			name: 'maxQuotes',
			type: 'number',
			label: 'Maximale Anzahl Zitate',
			defaultValue: 6,
			min: 1,
			max: 20
		}
	]
}
