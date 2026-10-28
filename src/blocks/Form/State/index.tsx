import type { StateField } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrorsImpl } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React from 'react'
import { Controller } from 'react-hook-form'

import { Error } from '../Error'
import { stateOptions } from './options'

export const State: React.FC<
  StateField & {
    control: Control
    errors: Partial<FieldErrorsImpl>
  }
> = ({ name, control, errors, label, required }) => {
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
      <Controller
        control={control}
        defaultValue=""
        name={name}
        render={({ field: { onChange, onBlur, ref, value } }) => {
          const controlledValue = stateOptions.find((t) => t.value === value)

          return (
            <Select
              onValueChange={(val) => onChange(val)}
              value={controlledValue?.value ?? ''}
              name={name}
              required={!!required}
            >
              <SelectTrigger
                className="w-full"
                id={name}
                ref={ref}
                onBlur={onBlur}
                aria-invalid={!!errors[name]}
                aria-describedby={errors[name] ? `${name}-error` : undefined}
              >
                <SelectValue placeholder={label || name} />
              </SelectTrigger>
              <SelectContent>
                {stateOptions.map(({ label, value }) => {
                  return (
                    <SelectItem key={value} value={value}>
                      {label || name}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          )
        }}
        rules={{ required }}
      />
      {errors[name] && <Error name={name} />}
    </div>
  )
}
