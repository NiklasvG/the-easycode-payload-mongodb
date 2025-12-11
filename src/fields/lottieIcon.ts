import type { Field } from 'payload'
import deepMerge from '@/utilities/deepMerge'

export type LottieIconNames =
	| 'apple'
	| 'applause'
	| 'book'
	| 'cart'
	| 'clock'
	| 'cloud'
	| 'code'
	| 'computer'
	| 'confetti'
	| 'developer'
	| 'engagement'
	| 'firework'
	| 'git'
	| 'pen'
	| 'school'

export const lottieIconOptions: { label: string; value: LottieIconNames }[] = [
	{ label: 'Apple', value: 'apple' },
	{ label: 'Applause', value: 'applause' },
	{ label: 'Book', value: 'book' },
	{ label: 'Cart', value: 'cart' },
	{ label: 'Clock', value: 'clock' },
	{ label: 'Cloud', value: 'cloud' },
	{ label: 'Code', value: 'code' },
	{ label: 'Computer', value: 'computer' },
	{ label: 'Confetti', value: 'confetti' },
	{ label: 'Developer', value: 'developer' },
	{ label: 'Engagement', value: 'engagement' },
	{ label: 'Firework', value: 'firework' },
	{ label: 'Git', value: 'git' },
	{ label: 'Pen', value: 'pen' },
	{ label: 'School', value: 'school' }
]

type LottieIconFieldType = (options?: {
	/** Name des Feldes im Schema – default: "icon" */
	name?: string
	/** Label im Admin – default: "Icon" */
	label?: string
	/** Ob das Icon Pflichtfeld ist – default: false */
	required?: boolean
	/** Overrides für das Field-Objekt */
	overrides?: Partial<Field>
}) => Field

export const lottieIcon: LottieIconFieldType = ({
	name = 'icon',
	label = 'Icon',
	required = false,
	overrides = {}
} = {}) => {
	const baseField: Field = {
		name,
		type: 'select',
		label,
		required,
		options: lottieIconOptions,
		admin: {
			width: '50%'
		}
	}

	return deepMerge(baseField, overrides)
}
