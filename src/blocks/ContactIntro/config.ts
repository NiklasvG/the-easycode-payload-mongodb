// src/blocks/ContactIntro/config.ts
import type { Block } from 'payload'
import {
	FixedToolbarFeature,
	HeadingFeature,
	InlineToolbarFeature,
	lexicalEditor
} from '@payloadcms/richtext-lexical'

export const ContactIntroBlock: Block = {
	slug: 'contactIntro',
	interfaceName: 'ContactIntroBlock',
	labels: {
		singular: 'Contact Intro',
		plural: 'Contact Intros'
	},
	fields: [
		{
			name: 'badge',
			type: 'text',
			defaultValue: 'Kontakt'
		},
		{
			name: 'headline',
			type: 'text',
			defaultValue: 'Lass uns etwas Großartiges bauen.',
			required: true
		},
		{
			name: 'accentText',
			type: 'text',
			label: 'Akzentwort (optional, farbig)',
			required: false,
			defaultValue: 'Großartiges'
		},
		{
			name: 'subline',
			type: 'richText',
			editor: lexicalEditor({
				features: ({ rootFeatures }) => [
					...rootFeatures,
					HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
					FixedToolbarFeature(),
					InlineToolbarFeature()
				]
			})
		}
	]
}
