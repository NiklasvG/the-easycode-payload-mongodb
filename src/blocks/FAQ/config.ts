import {
	FixedToolbarFeature,
	HeadingFeature,
	InlineToolbarFeature,
	lexicalEditor,
	OrderedListFeature,
	UnorderedListFeature
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

export const FAQBlock: Block = {
	slug: 'faq',
	interfaceName: 'FAQBlock',
	labels: {
		singular: 'FAQ',
		plural: 'FAQs'
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
			name: 'overline',
			label: 'Overline / Kicker',
			type: 'text',
			admin: {
				description: 'Kleiner Text oberhalb der Überschrift (optional)'
			}
		},
		{
			name: 'headline',
			label: 'Überschrift',
			type: 'text',
			required: true
		},
		{
			name: 'intro',
			label: 'Einleitung',
			type: 'textarea',
			admin: {
				rows: 3
			}
		},
		{
			name: 'items',
			label: 'FAQ Einträge',
			type: 'array',
			required: true,
			minRows: 1,
			fields: [
				{
					name: 'question',
					label: 'Frage',
					type: 'text',
					required: true
				},
				{
					name: 'answer',
					type: 'richText',
					editor: lexicalEditor({
						features: ({ rootFeatures }) => {
							return [
								...rootFeatures,
								HeadingFeature({
									enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4']
								}),
								FixedToolbarFeature(),
								InlineToolbarFeature(),
								UnorderedListFeature(),
								OrderedListFeature()
							]
						}
					}),
					label: 'Antwort'
				}
			]
		}
	]
}
