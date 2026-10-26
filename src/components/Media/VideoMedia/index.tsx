'use client'

import { cn } from '@/utilities/ui'
import React from 'react'

import type { Props as MediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

export const VideoMedia: React.FC<MediaProps> = (props) => {
  const { onClick, resource, videoClassName, fill } = props

  if (resource && typeof resource === 'object') {
    if (!resource.url) return null

    return (
      <video
        className={cn('w-full', fill ? 'h-full object-contain' : 'h-auto', videoClassName)}
        controls
        preload="none"
        width={resource.width || undefined}
        height={resource.height || undefined}
        style={
          resource.width && resource.height
            ? { aspectRatio: `${resource.width}/${resource.height}` }
            : undefined
        }
        aria-label={resource.alt || resource.filename || 'Video'}
        onClick={onClick}
        playsInline
      >
        <source
          src={getMediaUrl(resource.url, resource.updatedAt)}
          type={resource.mimeType || undefined}
        />
        Dein Browser kann dieses Video nicht wiedergeben.{' '}
        <a href={getMediaUrl(resource.url, resource.updatedAt)}>Video herunterladen</a>.
      </video>
    )
  }

  return null
}
