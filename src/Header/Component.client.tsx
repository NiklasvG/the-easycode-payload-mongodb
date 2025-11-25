'use client'

import React, { useEffect, useState } from 'react'

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

	/* Storing the value in a useState to avoid hydration errors */
	const [theme, setTheme] = useState<string | null>(null)
	const { headerTheme, setHeaderTheme } = useHeaderTheme()

	useEffect(() => {
		setHeaderTheme(null)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname])

	useEffect(() => {
		if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [headerTheme])

	return (
		<header
			className="w-full z-40 lg:bg-background/90 lg:backdrop-blur-sm"
			{...(theme ? { 'data-theme': 'dark' } : {})}
		>
			<div className="flex items-center container mx-auto w-full py-4 lg:py-8 gap-8">
				<Link href="/" className="logo shrink-0">
					<Logo />
				</Link>
				<HeaderNav data={data} />
			</div>
		</header>
	)
}
