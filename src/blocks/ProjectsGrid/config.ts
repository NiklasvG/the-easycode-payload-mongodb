import { link } from '@/fields/link'
import type { Block } from 'payload'

export const ProjectsGridBlock: Block = {
	slug: 'projectsGrid',
	interfaceName: 'ProjectsGridBlock',
	labels: {
		singular: 'Projects Grid',
		plural: 'Projects Grid'
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
			defaultValue: 'Projekte'
		},
		{
			name: 'headline',
			type: 'text',
			label: 'Überschrift',
			required: false,
			defaultValue: 'Websites. E-Commerce. individuelle Lösungen'
		},
		{
			name: 'subhead',
			type: 'text',
			label: 'Subheadline',
			required: false,
			defaultValue: 'Der Erfolg deiner Projekte treibt uns an.'
		},
		{
			name: 'projectTypes',
			label: 'Projekt-Typen filtern',
			type: 'select',
			hasMany: true,
			required: false,
			admin: {
				description:
					'Wenn gesetzt, werden nur Projekte mit diesen Typen angezeigt.'
			},
			options: [
				{ label: 'Brand Webseite', value: 'brand-webseite' },
				{ label: 'Individualsoftware', value: 'individualsoftware' },
				{ label: 'E-Commerce', value: 'e-commerce' },
				{ label: 'App-Entwicklung', value: 'app-entwicklung' },
				{ label: 'Hosting', value: 'hosting' }
			]
		},

		link({
			appearances: false,
			overrides: {
				required: true,
				label: 'CTA-Link'
			}
		}),
		{
			name: 'projectsLimit',
			type: 'number',
			label: 'Anzahl Projekte',
			defaultValue: 4,
			min: 1,
			max: 100
		}
	]
}
