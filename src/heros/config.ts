import type { Field } from 'payload'

import {
	FixedToolbarFeature,
	HeadingFeature,
	InlineToolbarFeature,
	lexicalEditor
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
	name: 'hero',
	type: 'group',
	fields: [
		{
			name: 'type',
			type: 'select',
			defaultValue: 'textAnimation',
			label: 'Type',
			options: [
				{
					label: 'None',
					value: 'none'
				},
				{
					label: 'High Impact',
					value: 'highImpact'
				},
				{
					label: 'Medium Impact',
					value: 'mediumImpact'
				},
				{
					label: 'Low Impact',
					value: 'lowImpact'
				},
				{
					label: 'TextAnimation',
					value: 'textAnimation'
				}
			],
			required: true
		},
		{
			name: 'phrases',
			type: 'array',
			label: 'Phrases',
			admin: {
				condition: (_, { type } = {}) => type === 'textAnimation'
			},
			fields: [
				{
					name: 'phrase',
					type: 'text',
					label: 'Phrase',
					required: true
				}
			]
		},
		{
			name: 'title',
			type: 'text',
			label: 'Title',
			admin: {
				condition: (_, { type } = {}) => type === 'textAnimation'
			}
		},
		{
			name: 'description',
			type: 'textarea',
			label: 'Description',
			admin: {
				condition: (_, { type } = {}) => type === 'textAnimation'
			}
		},
		{
			name: 'tags',
			type: 'array',
			label: 'Tags',
			admin: {
				condition: (_, { type } = {}) => type === 'textAnimation'
			},
			fields: [
				{
					name: 'tag',
					type: 'text',
					label: 'Tag',
					required: true
				}
			]
		},
		{
			name: 'icons',
			type: 'array',
			label: 'Icons',
			minRows: 4,
			maxRows: 4,
			admin: {
				condition: (_, { type } = {}) => type === 'textAnimation' // falls du willst, dass es z. B. nur dann angezeigt wird
			},
			fields: [
				{
					name: 'icon',
					type: 'select',
					required: true,
					label: 'Icon',
					options: [
						{ label: 'Laptop', value: 'Laptop' },
						{ label: 'SquareCode', value: 'SquareCode' },
						{ label: 'Handshake', value: 'Handshake' },
						{ label: 'Paintbrush', value: 'Paintbrush' },
						{ label: 'Smartphone', value: 'Smartphone' },
						{ label: 'Server', value: 'Server' },
						{ label: 'Braces', value: 'Braces' },
						{ label: 'Sparkles', value: 'Sparkles' }
					]
				}
			]
		},
		{
			name: 'richText',
			type: 'richText',
			editor: lexicalEditor({
				features: ({ rootFeatures }) => {
					return [
						...rootFeatures,
						HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
						FixedToolbarFeature(),
						InlineToolbarFeature()
					]
				}
			}),
			label: false,
			admin: {
				condition: (_, { type } = {}) => type !== 'textAnimation'
			}
		},
		linkGroup({
			overrides: {
				maxRows: 2,
				admin: {
					condition: (_, { type } = {}) => type !== 'textAnimation'
				}
			}
		}),
		{
			name: 'media',
			type: 'upload',
			admin: {
				condition: (_, { type } = {}) =>
					['highImpact', 'mediumImpact', 'textAnimation'].includes(type)
			},
			relationTo: 'media',
			required: true
		}
	],
	label: false
}
