'use client'

import React, { useEffect } from 'react'

// Next
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Providers
import { useHeaderTheme } from '@/providers/HeaderTheme'

// Types
import type { Header } from '@/payload-types'

// Components
import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const pathname = usePathname()
  const { headerTheme, setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <div>
      <header
        className="min-h-18 md:min-h-22 lg:min-h-30 w-full z-40 lg:bg-transparent lg:backdrop-blur-xs relative"
        {...(headerTheme ? { 'data-theme': headerTheme } : {})}
      >
        <div className="flex items-center container mx-auto w-full py-4 lg:py-8 gap-8">
          <Link href="/" className="logo shrink-0">
            <Logo />
          </Link>
          <HeaderNav data={data} />
        </div>
      </header>
    </div>
  )
}
