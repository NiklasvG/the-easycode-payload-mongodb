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
			name: 'projectsPageUrl',
			type: 'text',
			label: 'URL für „Alle Projekte“',
			required: false,
			defaultValue: '/projekte'
		},
		{
			name: 'projectsLimit',
			type: 'number',
			label: 'Anzahl Projekte',
			defaultValue: 4,
			min: 1,
			max: 12
		}
	]
}
