'use client'

import { cn } from '@/utilities/ui'
import React, { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

import type { Props as MediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

export const VideoMedia: React.FC<MediaProps> = (props) => {
  const { onClick, resource, videoClassName } = props

  const videoRef = useRef<HTMLVideoElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const { current: video } = videoRef
    if (video && reducedMotion) video.pause()
  }, [reducedMotion])

  if (resource && typeof resource === 'object') {
    if (!resource.url) return null

    return (
      <video
        autoPlay={reducedMotion === false}
        className={cn(videoClassName)}
        controls={Boolean(reducedMotion)}
        loop
        muted
        onClick={onClick}
        playsInline
        ref={videoRef}
      >
        <source src={getMediaUrl(resource.url, resource.updatedAt)} type={resource.mimeType || undefined} />
      </video>
    )
  }

  return null
}
