'use client'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function CopyButton({ code }: { code: string }) {
  const [status, setStatus] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <span role="status" className="text-sm">
        {status}
      </span>
      <Button
        type="button"
        className="flex gap-1"
        variant={'secondary'}
        onClick={async () => {
          if (timer.current) clearTimeout(timer.current)
          try {
            await navigator.clipboard.writeText(code)
            setStatus('Code kopiert.')
          } catch {
            setStatus('Kopieren nicht möglich. Bitte den Code auswählen und manuell kopieren.')
          }
          timer.current = setTimeout(() => setStatus(''), 5000)
        }}
      >
        <span>Code kopieren</span>
        <Copy className="size-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
