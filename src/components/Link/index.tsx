'use client'

import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import type { Page, Post } from '@/payload-types'
import { resolveCMSLinkHref } from '@/utilities/resolveCMSLinkHref'

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
  'aria-current'?: React.AriaAttributes['aria-current']
  'aria-label'?: string
  'aria-describedby'?: string
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
    onClick,
    'aria-current': ariaCurrent,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
  } = props

  const href = resolveCMSLinkHref({ type, url, reference })

  if (!href) return null

  const size = appearance === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href === '#cookie-settings') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('show-cookie-banner'))
    }
    if (onClick) onClick(e)
  }

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') {
    return (
      <Link
        className={cn(className)}
        href={href}
        aria-current={ariaCurrent}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        {...newTabProps}
        onClick={handleClick}
      >
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
        aria-current={ariaCurrent}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        {...newTabProps}
        onClick={handleClick}
      >
        {label && label}
        {children && children}
      </Link>
    </Button>
  )
}
