import type { Metadata } from 'next'

import localFont from 'next/font/local'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'
import { AIChat } from '@/components/Chat/AIChat'
import { UmamiAnalytics } from '@/components/UmamiAnalytics'
import { CookieBanner } from '@/components/CookieBanner'

// Published CMS pages are prerendered during the build and refreshed by CMS hooks.
export const revalidate = 3600

const geistMono = localFont({
	src: '../../fonts/GeistMono-variable.woff2',
	preload: false,
	weight: '100 900',
	display: 'swap',
	variable: '--font-geist-mono',
})

export default async function RootLayout({
	children
}: {
	children: React.ReactNode
}) {
	return (
		<html
			className={geistMono.variable}
			lang="de"
			suppressHydrationWarning
		>
			<head>
				<InitTheme />
				<link href="/favicon.ico" rel="icon" sizes="32x32" />
				<link href="/favicon.svg" rel="icon" type="image/svg+xml" />
			</head>
			<body>
				{/* Background Gradients */}
				<div className="absolute top-0 left-0 w-full h-full pointer-events-none z-30 overflow-hidden">
					<div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
				</div>
				<Providers>
					<PreviewBar />
					<Header />
					{children}
					<Footer />
					<AIChat />
					<UmamiAnalytics
						scriptUrl={process.env.UMAMI_SCRIPT_URL}
						websiteId={process.env.UMAMI_WEBSITE_ID}
					/>
					<CookieBanner />
				</Providers>
			</body>
		</html>
	)
}

export const metadata: Metadata = {
	metadataBase: new URL(getServerSideURL()),
	openGraph: mergeOpenGraph(),
	twitter: {
		card: 'summary_large_image',
		creator: '@the_easycode'
	}
}

async function PreviewBar() {
  const { isEnabled } = await draftMode()
  return <AdminBar adminBarProps={{ preview: isEnabled }} />
}
