import { withPayload } from '@payloadcms/next/withPayload'
import { withSentryConfig } from '@sentry/nextjs'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
	? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
	: process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
				const url = new URL(item)

				return {
					hostname: url.hostname,
					protocol: url.protocol.replace(':', '')
				}
			})
		]
	},
	webpack: (webpackConfig) => {
		webpackConfig.resolve.extensionAlias = {
			'.cjs': ['.cts', '.cjs'],
			'.js': ['.ts', '.tsx', '.js', '.jsx'],
			'.mjs': ['.mts', '.mjs']
		}

		return webpackConfig
	},
	reactStrictMode: true,
	redirects
}

// Sentry Webpack Plugin Optionen (aus dem Wizard übernommen)
const sentryWebpackPluginOptions = {
	// Für alle Optionen:
	// https://www.npmjs.com/package/@sentry/webpack-plugin#options
	org: 'the-easycode',
	project: 'javascript-nextjs',

	// Nur im CI loggen
	silent: !process.env.CI,

	// Mehr Source Maps → schönere Stacktraces (langsamerer Build)
	widenClientFileUpload: true,

	// Logger-Statements aus dem Bundle werfen
	disableLogger: true,

	// Vercel Cron Monitors
	automaticVercelMonitors: true

	// tunnelRoute kannst du später ergänzen, falls du willst
	// tunnelRoute: "/monitoring",
}

// Erst Payload-Wrapper anwenden …
const configWithPayload = withPayload(nextConfig, {
	devBundleServerPackages: false
})

// … dann Sentry-Wrapper und als Default exportieren
export default withSentryConfig(configWithPayload, sentryWebpackPluginOptions)
