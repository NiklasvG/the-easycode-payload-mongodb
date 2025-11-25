import tailwindcssAnimate from 'tailwindcss-animate'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
const config = {
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}'
	],
	darkMode: ['selector', '[data-theme="dark"]'],
	plugins: [tailwindcssAnimate, typography],
	prefix: '',
	safelist: [
		'lg:col-span-4',
		'lg:col-span-6',
		'lg:col-span-8',
		'lg:col-span-12',
		'border-border',
		'bg-card',
		'border-error',
		'bg-error/30',
		'border-success',
		'bg-success/30',
		'border-warning',
		'bg-warning/30'
	],
	theme: {
		container: {
			center: true,
			padding: {
				'2xl': '2rem',
				DEFAULT: '1rem',
				lg: '2rem',
				md: '2rem',
				sm: '1rem',
				xl: '2rem'
			},
			screens: {
				'2xl': '86rem',
				lg: '64rem',
				md: '48rem',
				sm: '40rem',
				xl: '80rem'
			}
		},
		extend: {
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				accent: {
					DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
					foreground: 'oklch(var(--accent-foreground) / <alpha-value>)'
				},
				background: 'oklch(var(--background) / <alpha-value>)',
				border: 'oklcha(var(--border) / <alpha-value>)',
				card: {
					DEFAULT: 'oklch(var(--card) / <alpha-value>)',
					foreground: 'oklch(var(--card-foreground) / <alpha-value>)'
				},
				destructive: {
					DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
					foreground: 'oklch(var(--destructive-foreground) / <alpha-value>)'
				},
				foreground: 'oklch(var(--foreground) / <alpha-value>)',
				input: 'oklch(var(--input) / <alpha-value>)',
				muted: {
					DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
					foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
				},
				popover: {
					DEFAULT: 'oklch(var(--popover) / <alpha-value>)',
					foreground: 'oklch(var(--popover-foreground) / <alpha-value>)'
				},
				primary: {
					DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
					foreground: 'oklch(var(--primary-foreground) / <alpha-value>)'
				},
				ring: 'oklch(var(--ring) / <alpha-value>)',
				secondary: {
					DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
					foreground: 'oklch(var(--secondary-foreground) / <alpha-value>)',
					background: 'oklch(var(--secondary-background) / <alpha-value>)'
				},
				success: 'oklch(var(--success) / <alpha-value>)',
				error: 'oklch(var(--error) / <alpha-value>)',
				warning: 'oklch(var(--warning) / <alpha-value>)'
			},
			fontFamily: {
				mono: ['var(--font-geist-mono)'],
				sans: ['var(--font-geist-sans)']
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				}
			},
			strokeWidth: {
				3: '3px'
			},
			typography: () => ({
				DEFAULT: {
					css: [
						{
							'--tw-prose-body': 'var(--text)',
							'--tw-prose-headings': 'var(--text)',
							h1: {
								fontWeight: 'normal',
								marginBottom: '0.25em'
							}
						}
					]
				},
				base: {
					css: [
						{
							h1: {
								fontSize: '2.5rem'
							},
							h2: {
								fontSize: '1.25rem',
								fontWeight: 600
							}
						}
					]
				},
				md: {
					css: [
						{
							h1: {
								fontSize: '3.5rem'
							},
							h2: {
								fontSize: '1.5rem'
							}
						}
					]
				}
			})
		}
	}
}

export default config
