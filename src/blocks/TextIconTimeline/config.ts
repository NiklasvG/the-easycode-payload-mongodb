import { lottieIcon } from '@/fields/lottieIcon'
import type { Block } from 'payload'

export const TextIconTimelineBlock: Block = {
	slug: 'textIconTimeline',
	interfaceName: 'TextIconTimelineBlock',
	labels: {
		singular: 'Text-Icon Timeline',
		plural: 'Text-Icon Timelines'
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
			defaultValue: 'Unsere Geschichte'
		},
		{
			name: 'headline',
			type: 'text',
			label: 'Überschrift',
			required: false,
			defaultValue: 'Meilensteine & <span class="highlight">Entwicklung</span>'
		},
		{
			name: 'accentText',
			type: 'text',
			label: 'Akzentwort (optional, farbig)',
			required: false,
			defaultValue: 'Geschichte'
		},
		{
			name: 'subhead',
			type: 'text',
			label: 'Subheadline',
			required: false,
			defaultValue:
				'Wichtige Stationen, die meinen Weg als Freelancer und die Zusammenarbeit mit Kund:innen geprägt haben.'
		},
		{
			name: 'items',
			type: 'array',
			label: 'Timeline-Elemente',
			minRows: 1,
			labels: {
				singular: 'Element',
				plural: 'Elemente'
			},
			fields: [
				lottieIcon(),
				{
					name: 'title',
					type: 'text',
					label: 'Titel / Jahr',
					required: true,
					admin: {
						description: 'z.B. "1999:", "2015", "Launch Biome Cards" …'
					}
				},
				{
					name: 'text',
					type: 'textarea',
					label: 'Text',
					required: true
				}
			]
		}
	]
}
