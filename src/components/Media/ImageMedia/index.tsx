'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import NextImage from 'next/image'
import React from 'react'

import type { Props as MediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'
import { AIImageBadge } from '@/components/AIImageBadge'

export const ImageMedia: React.FC<MediaProps> = (props) => {
	const {
		alt: altFromProps,
		fill,
		pictureClassName,
		imgClassName,
		priority,
		resource,
		size: sizeFromProps,
		src: srcFromProps,
		quality = 75, onLoad, onClick, loading: loadingFromProps
	} = props

	let width: number | undefined
	let height: number | undefined
	let alt = altFromProps
	let src: StaticImageData | string = srcFromProps || ''

	if (!src && resource && typeof resource === 'object') {
		const {
			alt: altFromResource,
			height: fullHeight,
			url,
			width: fullWidth
		} = resource

		width = fullWidth!
		height = fullHeight!
		alt = altFromProps ?? altFromResource ?? ''

		const cacheTag = resource.updatedAt

		src = getMediaUrl(url, cacheTag)
	}

	const loading = loadingFromProps || (!priority ? 'lazy' : undefined)

	const sizes = sizeFromProps || '100vw'
    if (!src) return null

	const image = (
		<picture className={cn(fill && 'relative block h-full w-full', pictureClassName)}>
			<NextImage
				alt={alt || ''}
				className={cn(imgClassName)}
				fill={fill}
				height={!fill ? height : undefined}
				placeholder="empty"
				
				fetchPriority={priority ? 'high' : undefined}
				quality={quality}
                onLoad={onLoad}
                onClick={onClick}
				loading={priority ? 'eager' : loading}
				sizes={sizes}
				src={src}
				width={!fill ? width : undefined}
			/>
		</picture>
	)

	if (resource && typeof resource === 'object' && resource.isAIGenerated) {
		return (
			<div className={cn('relative', fill ? 'h-full w-full' : 'inline-block max-w-full align-top')}>
				{image}
				<AIImageBadge resource={resource} />
			</div>
		)
	}

	return image
}

