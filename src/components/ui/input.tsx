import { cn } from '@/utilities/ui'
import * as React from 'react'

const Input: React.FC<
	{
		ref?: React.Ref<HTMLInputElement>
	} & React.InputHTMLAttributes<HTMLInputElement>
> = ({ type, className, ref, ...props }) => {
	return (
		<input
			className={cn(
				'w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white hover:border-accent/30 outline-none focus:border-accent/50 transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium',
				className
			)}
			ref={ref}
			type={type}
			{...props}
		/>
	)
}

export { Input }
