import { motion, AnimatePresence } from 'framer-motion'

export function AnimatedText({
	text,
	className
}: {
	text: string
	className?: string
}) {
	return (
		<div
			className={`inline-block h-[1.2em] overflow-hidden lg:translate-y-2 ${className || ''}`}
		>
			<AnimatePresence mode="wait">
				<motion.span
					key={text}
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: -20, opacity: 0 }}
					transition={{ duration: 0.4 }}
					className="inline-block"
				>
					{text}
				</motion.span>
			</AnimatePresence>
		</div>
	)
}
