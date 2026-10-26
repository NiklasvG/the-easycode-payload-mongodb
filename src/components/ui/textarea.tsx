import { cn } from '@/utilities/ui'
import * as React from 'react'

const Textarea: React.FC<
  {
    ref?: React.Ref<HTMLTextAreaElement>
  } & React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({ className, ref, ...props }) => {
  return (
    <textarea
      className={cn(
        'min-w-0 w-full min-h-32 bg-background border border-white/20 rounded-xl px-4 py-3 text-base text-foreground hover:border-accent/50 outline-hidden focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:border-red-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150 resize-y',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
}

export { Textarea }
