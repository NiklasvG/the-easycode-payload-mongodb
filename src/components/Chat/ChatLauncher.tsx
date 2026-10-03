'use client'

import dynamic from 'next/dynamic'
import { MessageSquare } from 'lucide-react'
import { useState } from 'react'

const DeferredChat = dynamic(() => import('./AIChat').then((module) => module.AIChat), {
  ssr: false,
  loading: () => <LauncherButton loading />,
})

function LauncherButton({ onClick, loading = false }: { onClick?: () => void; loading?: boolean }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        aria-busy={loading}
        aria-label={loading ? 'KI-Chat wird geladen' : 'KI-Chat öffnen'}
        aria-expanded={false}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-accent hover:bg-accent-dark text-white shadow-lg shadow-accent/20 transition-transform duration-300 hover:scale-110 active:scale-95"
      >
        <MessageSquare className="w-6 h-6" aria-hidden="true" />
      </button>
    </div>
  )
}

export function ChatLauncher() {
  const [activated, setActivated] = useState(false)
  return activated ? (
    <DeferredChat initiallyOpen />
  ) : (
    <LauncherButton onClick={() => setActivated(true)} />
  )
}
