import { cn } from '@/utilities/ui'
import * as React from 'react'
import { fieldStyles } from './fieldStyles'

const Input: React.FC<
  {
    ref?: React.Ref<HTMLInputElement>
  } & React.InputHTMLAttributes<HTMLInputElement>
> = ({ type, className, ref, ...props }) => {
  return (
    <input
      className={cn(
        fieldStyles,
        'min-h-12 rounded-full file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    />
  )
}

export { Input }
