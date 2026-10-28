'use client'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const categoryTitles = showCategories
    ? categories?.flatMap((category) =>
        typeof category === 'object' && category.title ? [category.title] : [],
      )
    : []
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = slug ? `/${relationTo || 'posts'}/${encodeURIComponent(slug)}` : null

  return (
    <article
      className={cn(
        'relative min-w-0 rounded-2xl border border-white/15 bg-card [overflow-wrap:anywhere] focus-within:border-accent',
        className,
      )}
    >
      {metaImage && typeof metaImage === 'object' && metaImage.url && (
        <div className="relative w-full overflow-hidden rounded-t-2xl">
          <Media
            resource={metaImage}
            imgClassName="w-full h-auto"
            size="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-5 sm:p-6">
        {categoryTitles && categoryTitles.length > 0 && (
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            {categoryTitles.join(', ')}
          </p>
        )}
        {titleToUse && (
          <h3 className="text-xl! leading-snug!">
            {href ? (
              <Link
                className="after:absolute after:inset-0 hover:underline focus-visible:underline"
                href={href}
              >
                {titleToUse}
              </Link>
            ) : (
              titleToUse
            )}
          </h3>
        )}
        {description && (
          <p className="mt-3 text-muted-foreground leading-relaxed">{sanitizedDescription}</p>
        )}
      </div>
    </article>
  )
}
