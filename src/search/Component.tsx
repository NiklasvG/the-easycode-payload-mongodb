'use client'
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter } from 'next/navigation'
import { SearchCode } from 'lucide-react'

export const Search: React.FC = () => {
	const [value, setValue] = useState('')
	const router = useRouter()

	const debouncedValue = useDebounce(value)

	useEffect(() => {
		router.push(`/suche${debouncedValue ? `?q=${debouncedValue}` : ''}`)
	}, [debouncedValue, router])

	return (
		<div>
			<form
				onSubmit={(e) => {
					e.preventDefault()
				}}
			>
				<div className="relative group">
					<div className="relative flex items-center group-focus-within:drop-shadow-[0px_4px_30px_rgba(0,173,178,0.25)] duration-300 ease-in-out">
						<SearchCode className="absolute left-6 w-6 h-6 text-secondary-foreground/50 group-focus-within:text-accent transition-colors" />
						<input
							type="text"
							id="search"
							value={value}
							onChange={(e) => setValue(e.target.value)}
							placeholder="Projekte, Kunden, Seiten..."
							className="w-full bg-secondary text-secondary-foreground border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-xl focus:outline-none focus:border-accent/50 hover:border-accent/50 transition-all placeholder:secondary-foreground/50"
						/>
					</div>
				</div>
			</form>
		</div>
	)
}
