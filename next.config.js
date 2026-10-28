import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL =
	process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',
	distDir: process.env.NEXT_BUILD_DIR || '.next',
	outputFileTracingExcludes: { '/*': ['./test-results/**/*', './playwright-report/**/*', './tests/**/*', './experiments/**/*', './docs/**/*', './.quality-*'] },
	// Use static generation and ISR without streaming a partially rendered loading shell.
	cacheComponents: false,
	async headers() {
		return [{ source: '/:path*', headers: [
			{ key: 'X-Content-Type-Options', value: 'nosniff' },
			{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
			{ key: 'X-Frame-Options', value: 'SAMEORIGIN' },
			{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
			{ key: 'Content-Security-Policy', value: "object-src 'none'; base-uri 'self'; frame-ancestors 'self'" },
			...(NEXT_PUBLIC_SERVER_URL.startsWith('https://') ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }] : []),
			...(process.env.APP_ENV === 'staging' ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] : []),
		] }]
	},
	images: {
		// Include mobile widths even when Next.js filters srcset using a 100vw sizes hint.
		deviceSizes: [384, 480, 512, 560, 608, 640, 704, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [32, 48, 64, 96, 100, 128, 170, 212, 256, 320],
		qualities: [75, 85, 100],
		formats: ['image/avif', 'image/webp'],
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

