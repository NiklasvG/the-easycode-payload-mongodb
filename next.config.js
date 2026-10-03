import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL =
	process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',
	async headers() {
		return [{ source: '/:path*', headers: [
			{ key: 'X-Content-Type-Options', value: 'nosniff' },
			{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
			{ key: 'X-Frame-Options', value: 'SAMEORIGIN' },
			...(process.env.APP_ENV === 'staging' ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] : []),
		] }]
	},
	images: {
		qualities: [75, 85, 100],
		localPatterns: [
			{ pathname: '/api/media/file/**' },
			{ pathname: '/media/**' },
			{ pathname: '/**', search: '' }
		],
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

export default withPayload(nextConfig, {
	devBundleServerPackages: false
})

