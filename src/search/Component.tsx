'use client'
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter, useSearchParams } from 'next/navigation'
import { SearchCode } from 'lucide-react'

export const Search: React.FC = () => {
	const searchParams = useSearchParams()
	const query = searchParams.get('q') || ''
	const [input, setInput] = useState<{ value: string; queryAtEdit: string } | null>(null)
	const value = input?.queryAtEdit === query ? input.value : query
	const router = useRouter()

	const debouncedValue = useDebounce(value)

	useEffect(() => {
		if (!input || input.queryAtEdit !== query || debouncedValue === query) return
		const params = new URLSearchParams()
		if (debouncedValue) params.set('q', debouncedValue)
		router.replace(`/suche${params.size ? `?${params}` : ''}`, { scroll: false })
	}, [debouncedValue, query, input, router])

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
							onChange={(e) => setInput({ value: e.target.value, queryAtEdit: query })}
							maxLength={200}
							aria-label="Website durchsuchen"
							placeholder="Projekte, Kunden, Seiten..."
							className="w-full bg-secondary text-secondary-foreground border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-xl focus:outline-hidden focus:border-accent/50 hover:border-accent/50 transition-all placeholder:secondary-foreground/50"
						/>
					</div>
				</div>
			</form>
		</div>
	)
}
