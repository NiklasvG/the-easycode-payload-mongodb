import { cn } from '@/utilities/ui'
import * as React from 'react'
import { fieldStyles } from './fieldStyles'

const Textarea: React.FC<
  {
    ref?: React.Ref<HTMLTextAreaElement>
  } & React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({ className, ref, ...props }) => {
  return (
    <textarea
      className={cn(
        fieldStyles,
        'min-h-32 rounded-3xl resize-y',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
}

export { Textarea }
