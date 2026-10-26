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
  const navigate = (nextValue: string) => {
    const params = new URLSearchParams()
    if (nextValue.trim()) params.set('q', nextValue.trim())
    router.replace(`/suche${params.size ? `?${params}` : ''}`, { scroll: false })
  }

  useEffect(() => {
    if (!input || input.queryAtEdit !== query || debouncedValue === query) return
    const params = new URLSearchParams()
    if (debouncedValue) params.set('q', debouncedValue)
    router.replace(`/suche${params.size ? `?${params}` : ''}`, { scroll: false })
  }, [debouncedValue, query, input, router])

  return (
    <div>
      <form
        role="search"
        aria-label="Website durchsuchen"
        onSubmit={(e) => {
          e.preventDefault()
          navigate(value)
        }}
      >
        <div className="group flex min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch">
          <div className="relative min-w-0 flex-1">
            <SearchCode
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-accent transition-colors"
            />
            <input
              type="text"
              name="q"
              inputMode="search"
              enterKeyHint="search"
              id="search"
              value={value}
              onChange={(e) => setInput({ value: e.target.value, queryAtEdit: query })}
              maxLength={200}
              aria-label="Website durchsuchen"
              placeholder="Projekte, Kunden, Seiten..."
              className="w-full min-w-0 bg-secondary text-secondary-foreground border border-white/20 rounded-2xl py-5 pl-12 pr-4 text-base sm:text-xl focus:border-accent transition-colors placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            className="min-h-11 max-w-full px-5 py-3 rounded-2xl border border-white/20 bg-secondary text-accent font-semibold focus-visible:outline-2 focus-visible:outline-accent"
          >
            Suchen
          </button>
        </div>
      </form>
    </div>
  )
}
