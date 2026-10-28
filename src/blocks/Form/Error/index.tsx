'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'

export const Error = ({ name }: { name: string }) => {
  const {
    formState: { errors },
  } = useFormContext()
  return (
    <div
      id={`${name}-error`}
      role="alert"
      className="mt-2 text-red-400 text-sm [overflow-wrap:anywhere]"
    >
      {(errors[name]?.message as string) || 'Bitte fülle dieses Feld aus.'}
    </div>
  )
}
