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
				'w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white hover:border-accent/30 outline-none focus:border-accent/50 transition-all resize-none',
				className
			)}
			ref={ref}
			{...props}
		/>
	)
}

export { Textarea }
