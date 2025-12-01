import type { Block } from 'payload'
import { link } from '@/fields/link'

export const ProjectCtaBlock: Block = {
	slug: 'projectCta',
	interfaceName: 'ProjectCtaBlock',
	labels: {
		singular: 'Projekt-CTA',
		plural: 'Projekt-CTAs'
	},
	fields: [
		{
			name: 'headline',
			type: 'text',
			label: 'Überschrift',
			required: true,
			defaultValue: 'Bereit für dein Projekt?'
		},
		link({
			appearances: false,
			overrides: {
				required: true
			}
		}),
		{
			name: 'backgroundVariant',
			type: 'select',
			label: 'Hintergrund',
			required: true,
			defaultValue: 'secondary',
			options: [
				{ label: 'Sekundär (bg-secondary-background/30)', value: 'secondary' },
				{ label: 'Primär (bg-background)', value: 'primary' }
			]
		}
	]
}
