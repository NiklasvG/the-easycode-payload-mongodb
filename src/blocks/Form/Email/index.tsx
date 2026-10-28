import type { EmailField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

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
> = ({ name, defaultValue, errors, label, register, required, placeholder }) => {
  return (
    <div>
      <Label htmlFor={name}>
        {label || name}

        {required && (
          <span className="required">
            * <span className="sr-only">(Pflichtfeld)</span>
          </span>
        )}
      </Label>
      <Input
        defaultValue={defaultValue}
        maxLength={4000}
        id={name}
        aria-required={!!required}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        type="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        placeholder={placeholder || undefined}
        {...register(name, { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, required })}
      />

      {errors[name] && <Error name={name} />}
    </div>
  )
}
