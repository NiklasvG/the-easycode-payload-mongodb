import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import type { Page, Post } from '@/payload-types'

type CMSLinkType = {
	appearance?: 'inline' | ButtonProps['variant']
	children?: React.ReactNode
	className?: string
	label?: string | null
	newTab?: boolean | null
	reference?: {
		relationTo: 'pages' | 'posts'
		value: Page | Post | string | number
	} | null
	size?: ButtonProps['size'] | null
	type?: 'custom' | 'reference' | null
	url?: string | null
	onClick?: React.MouseEventHandler<HTMLAnchorElement>
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
	const {
		type,
		appearance = 'inline',
		children,
		className,
		label,
		newTab,
		reference,
		size: sizeFromProps,
		url,
		onClick
	} = props

	// Wir berechnen die HREF nun mit einer Logik, die Breadcrumbs bevorzugt
	const getHref = () => {
		if (type === 'custom') return url || ''

		if (
			type === 'reference' &&
			typeof reference?.value === 'object' &&
			reference.value.slug
		) {
			// 1. Spezifische Logik für Pages mit Nested Docs (Breadcrumbs)
			if (
				reference.relationTo === 'pages' &&
				'breadcrumbs' in reference.value
			) {
				const breadcrumbs = reference.value.breadcrumbs
				// Nimm den letzten Breadcrumb, dieser enthält den vollen Pfad
				const lastBreadcrumb = Array.isArray(breadcrumbs)
					? breadcrumbs[breadcrumbs.length - 1]
					: null

				if (lastBreadcrumb?.url) {
					return lastBreadcrumb.url
				}
			}

			// 2. Standard Fallback (z.B. für Posts oder wenn keine Breadcrumbs da sind)
			// Generiert: /slug (für Pages) oder /posts/slug (für Posts)
			const prefix =
				reference.relationTo !== 'pages' ? `/${reference.relationTo}` : ''
			return `${prefix}/${reference.value.slug}`
		}

		return ''
	}

	const href = getHref()

	if (!href) return null

	const size = appearance === 'link' ? 'clear' : sizeFromProps
	const newTabProps = newTab
		? { rel: 'noopener noreferrer', target: '_blank' }
		: {}

	/* Ensure we don't break any styles set by richText */
	if (appearance === 'inline') {
		return (
			<Link className={cn(className)} href={href} {...newTabProps}>
				{label && label}
				{children && children}
			</Link>
		)
	}

	return (
		<Button asChild className={className} size={size} variant={appearance}>
			<Link
				className={cn(className)}
				href={href}
				{...newTabProps}
				onClick={onClick}
			>
				{label && label}
				{children && children}
			</Link>
		</Button>
	)
}
