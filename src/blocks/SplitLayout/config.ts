// src/blocks/SplitLayout/config.ts
import type { Block } from 'payload'

import { ContactIntroBlock } from '@/blocks/ContactIntro/config'
import { ContactLinksBlock } from '@/blocks/ContactLinks/config'
import { FormBlock } from '@/blocks/Form/config'

export const SplitLayoutBlock: Block = {
	slug: 'splitLayout',
	interfaceName: 'SplitLayoutBlock',
	labels: {
		singular: 'Split Layout',
		plural: 'Split Layouts'
	},
	fields: [
		{
			name: 'layout',
			type: 'select',
			defaultValue: '50-50',
			options: [
				{ label: '50 / 50', value: '50-50' },
				{ label: '40 / 60', value: '40-60' },
				{ label: '60 / 40', value: '60-40' }
			]
		},
		{
			name: 'gap',
			type: 'select',
			defaultValue: 'lg',
			options: [
				{ label: 'Small', value: 'sm' },
				{ label: 'Medium', value: 'md' },
				{ label: 'Large', value: 'lg' }
			]
		},
		{
			name: 'left',
			label: 'Left Slot',
			type: 'blocks',
			blocks: [ContactIntroBlock, ContactLinksBlock, FormBlock]
		},
		{
			name: 'right',
			label: 'Right Slot',
			type: 'blocks',
			blocks: [ContactIntroBlock, ContactLinksBlock, FormBlock]
		}
	]
}
