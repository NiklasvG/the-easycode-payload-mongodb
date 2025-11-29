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
		<div>
			<header
				className="w-full z-40 lg:bg-transparent lg:backdrop-blur-sm relative"
				{...(theme ? { 'data-theme': 'dark' } : {})}
			>
				{/* Background Gradients */}
				<div className="absolute top-0 left-0 w-full h-full pointer-events-none z-30">
					<div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
					{/* <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px]" /> */}
				</div>
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
