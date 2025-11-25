import type { Block } from 'payload'

export const ClientsSliderBlock: Block = {
	slug: 'clientsSlider',
	interfaceName: 'ClientsSliderBlock',
	labels: {
		singular: 'Clients Slider',
		plural: 'Clients Slider'
	},
	fields: [
		{
			name: 'heading',
			type: 'text',
			label: 'Überschrift (optional)',
			required: false
		}
	]
}
