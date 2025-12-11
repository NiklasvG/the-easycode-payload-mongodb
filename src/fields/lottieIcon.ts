import type { Field } from 'payload'
import deepMerge from '@/utilities/deepMerge'

export type LottieIconNames =
	| 'computer'
	| 'cloud'
	| 'apple'
	| 'cart'
	| 'pen'
	| 'engagement'
	| 'code'
	| 'clock'
	| 'applause'
	| 'git'
	| 'book'
	| 'firework'
	| 'confetti'
	| 'developer'
	| 'school'

export const lottieIconOptions: { label: string; value: LottieIconNames }[] = [
	{ label: 'Computer', value: 'computer' },
	{ label: 'Cloud', value: 'cloud' },
	{ label: 'Apple', value: 'apple' },
	{ label: 'Cart', value: 'cart' },
	{ label: 'Pen', value: 'pen' },
	{ label: 'Engagement', value: 'engagement' },
	{ label: 'Code', value: 'code' },
	{ label: 'Clock', value: 'clock' },
	{ label: 'Applause', value: 'applause' },
	{ label: 'Git', value: 'git' },
	{ label: 'Book', value: 'book' },
	{ label: 'Firework', value: 'firework' },
	{ label: 'Confetti', value: 'confetti' },
	{ label: 'Developer', value: 'developer' },
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
			// du kannst hier z. B. nochmal Standard-Layout setzen
			width: '50%'
		}
	}

	return deepMerge(baseField, overrides)
}
