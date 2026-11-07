// src/blocks/InfoTwoColumn/config.ts
import type { Block } from 'payload'
import { link } from '@/fields/link'

export const InfoTwoColumnBlock: Block = {
	slug: 'infoTwoColumn',
	interfaceName: 'InfoTwoColumnBlock',
	labels: {
		singular: 'Info (2 Spalten)',
		plural: 'Infos (2 Spalten)'
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
			name: 'reverseOnDesktop',
			type: 'checkbox',
			label: 'Spalten auf Desktop tauschen (Text rechts, Liste links)',
			defaultValue: false
		},
		{
			name: 'overhead',
			type: 'text',
			label: 'Overhead (kleine Überschrift)',
			required: false,
			defaultValue: 'Jetzt deine Website erstellen lassen, die bewegt'
		},
		{
			name: 'headline',
			type: 'text',
			label: 'Überschrift',
			required: false,
			defaultValue: 'Dein Webentwickler für einen starken Onlineauftritt'
		},
		{
			name: 'accentText',
			type: 'text',
			label: 'Akzentwort/-phrase (optional, farbig)',
			required: false,
			defaultValue: 'starken Onlineauftritt'
		},
		{
			name: 'enableLink',
			type: 'checkbox',
			label: 'CTA unter der Überschrift anzeigen',
			defaultValue: false
		},
		link({
			appearances: false,
			overrides: {
				label: 'CTA-Link',
				admin: {
					condition: (_, siblingData) => Boolean(siblingData?.enableLink)
				}
			}
		}),
		{
			name: 'body',
			type: 'textarea',
			label: 'Fließtext (rechts, oberhalb der Liste)',
			required: false,
			defaultValue:
				'Ich entwickle eine Website, die dein Unternehmen verständlich präsentiert und auf Smartphone, Tablet und Desktop funktioniert. Von der Konzeption über das Design bis zum Launch hast du einen direkten Ansprechpartner. Inhalte kannst du anschließend selbst im CMS pflegen.'
		},
		{
			name: 'listHeadline',
			type: 'text',
			label: 'Überschrift über der Liste',
			required: false,
			defaultValue: 'Das bekommst du bei der Zusammenarbeit mit mir'
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
			],
			defaultValue: [
				{
					text: 'Deine Website wird individuell auf deine Zielgruppe abgestimmt.'
				},
				{
					text: 'Ich verbinde ansprechendes Design mit schnellen Ladezeiten.'
				},
				{
					text: 'Du profitierst von einer klaren Struktur und hoher Nutzungsfreundlichkeit.'
				},
				{
					text: 'Ich berücksichtige technische SEO-Grundlagen und verständliche Inhalte.'
				}
			]
		}
	]
}
