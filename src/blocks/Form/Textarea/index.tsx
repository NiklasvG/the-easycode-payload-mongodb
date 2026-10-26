import type { TextAreaField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import { Textarea as TextAreaComponent } from '@/components/ui/textarea'
import React from 'react'

import { Error } from '../Error'

export const Textarea: React.FC<
  TextAreaField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
    rows?: number
    placeholder?: string
  }
> = ({ name, defaultValue, errors, label, register, required, rows = 3, placeholder }) => {
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

      <TextAreaComponent
        defaultValue={defaultValue}
        maxLength={4000}
        id={name}
        aria-required={!!required}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        rows={rows}
        placeholder={placeholder || undefined}
        {...register(name, {
          required,
          validate: (value) =>
            !required || !!String(value ?? '').trim() || 'Bitte fülle dieses Feld aus.',
        })}
      />

      {errors[name] && <Error name={name} />}
    </div>
  )
}
