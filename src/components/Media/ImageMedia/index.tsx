'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import NextImage from 'next/image'
import React from 'react'

import type { Props as MediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

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

	return (
		<picture className={cn(fill && 'relative block h-full w-full', pictureClassName)}>
			<NextImage
				alt={alt || ''}
				className={cn(imgClassName)}
				fill={fill}
				height={!fill ? height : undefined}
				placeholder="empty"
				
				preload={priority}
				quality={quality}
                onLoad={onLoad}
                onClick={onClick}
				loading={priority ? undefined : loading}
				sizes={sizes}
				src={src}
				width={!fill ? width : undefined}
			/>
		</picture>
	)
}

