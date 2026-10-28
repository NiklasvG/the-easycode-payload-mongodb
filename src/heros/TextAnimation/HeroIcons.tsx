import type { ReactNode } from 'react'

export function HeroIcons({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden="true" className="hero-icons absolute inset-0 pointer-events-none">
      {children}
    </div>
  )
}
