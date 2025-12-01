// src/blocks/InfoTwoColumn/config.ts
import type { Block } from 'payload'

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
			defaultValue: 'Website Agentur für starke Onlineauftritte'
		},
		{
			name: 'accentText',
			type: 'text',
			label: 'Akzentwort/-phrase (optional, farbig)',
			required: false,
			defaultValue: 'starke Onlineauftritte'
		},
		{
			name: 'body',
			type: 'textarea',
			label: 'Fließtext (rechts, oberhalb der Liste)',
			required: false,
			defaultValue:
				'Eine Website ist oft der erste Eindruck deines Unternehmens. Was, wenn dieser nicht überzeugt? Veraltetes Design oder lange Ladezeiten schrecken ab. Wir setzen auf individuelles Webdesign, responsives Design und Nutzungsfreundlichkeit. Als Website Agentur begleiten wir dich von der Idee bis zur fertigen Seite und sorgen dafür, dass du am Ende auf ein Ergebnis blicken kannst, das deine Zielgruppe begeistert und deren Vertrauen in dein Unternehmen stärkt.'
		},
		{
			name: 'listHeadline',
			type: 'text',
			label: 'Überschrift über der Liste',
			required: false,
			defaultValue: 'Deine Vorteile mit unserer Website Entwicklung'
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
					text: 'Wir kombinieren ansprechendes Design mit optimaler Performance.'
				},
				{
					text: 'Du profitierst von einer klaren Struktur und hoher Nutzungsfreundlichkeit.'
				},
				{
					text: 'Wir sorgen dafür, dass deine Seite gefunden und geliebt wird.'
				}
			]
		}
	]
}
