'use client'
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter, useSearchParams } from 'next/navigation'
import { SearchCode } from 'lucide-react'
import { Input } from '@/components/ui/input'

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
        <div className="group relative min-w-0">
          <SearchCode
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-accent transition-colors"
          />
          <Input
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
            className="pl-12"
          />
        </div>
      </form>
    </div>
  )
}
