import type { EmailField } from '@payloadcms/plugin-form-builder/types'
import type {
	FieldErrorsImpl,
	FieldValues,
	UseFormRegister
} from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

import { Error } from '../Error'

export const Email: React.FC<
	EmailField & {
		errors: Partial<FieldErrorsImpl>
		register: UseFormRegister<FieldValues>
		placeholder?: string
	}
> = ({
	name,
	defaultValue,
	errors,
	label,
	register,
	required,
	placeholder
}) => {
	return (
		<div>
			<Label htmlFor={name}>
				{label}

				{required && (
					<span className="required">
						* <span className="sr-only">(required)</span>
					</span>
				)}
			</Label>
			<Input
				defaultValue={defaultValue}
				id={name}
				type="email"
				placeholder={placeholder || undefined}
				{...register(name, { pattern: /^\S[^\s@]*@\S+$/, required })}
			/>

			{errors[name] && <Error name={name} />}
		</div>
	)
}
