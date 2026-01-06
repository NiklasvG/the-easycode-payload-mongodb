// src/blocks/ContactLinks/config.ts
import type { Block } from 'payload'

export const ContactLinksBlock: Block = {
	slug: 'contactLinks',
	interfaceName: 'ContactLinksBlock',
	labels: {
		singular: 'Contact Links',
		plural: 'Contact Links'
	},
	fields: [
		{
			name: 'email',
			type: 'text',
			required: true,
			defaultValue: 'info@the-easycode.eu'
		},
		{
			name: 'socials',
			type: 'array',
			fields: [
				{
					name: 'type',
					type: 'select',
					required: true,
					options: [
						{ label: 'LinkedIn', value: 'linkedin' },
						{ label: 'Instagram', value: 'instagram' },
						{ label: 'GitHub', value: 'github' },
						{ label: 'Website', value: 'website' }
					]
				},
				{
					name: 'label',
					type: 'text'
				},
				{
					name: 'url',
					type: 'text',
					required: true
				}
			]
		}
	]
}
