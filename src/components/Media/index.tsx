import { cn } from '@/utilities/ui'
import React, { Fragment } from 'react'

import type { Props } from './types'

import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'
import { getMediaUrl } from '@/utilities/getMediaUrl'

export const Media: React.FC<Props> = (props) => {
  const { className, htmlElement = 'div', resource } = props

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  const isPDF = typeof resource === 'object' && resource?.mimeType === 'application/pdf'
  const needsImageFrame =
    !props.fill &&
    !props.src &&
    typeof resource === 'object' &&
    resource?.url &&
    !isVideo &&
    !isPDF &&
    !(resource.width && resource.width > 0 && resource.height && resource.height > 0)
  const Tag = htmlElement || Fragment

  return (
    <Tag
      {...(htmlElement !== null
        ? {
            className: cn(props.fill && 'absolute inset-0', className),
          }
        : {})}
    >
      {isPDF && typeof resource === 'object' && resource?.url ? (
        <a
          href={getMediaUrl(resource.url, resource.updatedAt)}
          download
          className="inline-flex min-h-11 max-w-full items-center rounded-lg border border-white/20 px-4 py-3 text-accent underline underline-offset-4 [overflow-wrap:anywhere]"
        >
          PDF herunterladen: {resource.alt || resource.filename || 'Dokument'}
        </a>
      ) : isVideo ? (
        <VideoMedia {...props} />
      ) : needsImageFrame ? (
        <div className="relative aspect-video w-full">
          <ImageMedia {...props} fill imgClassName={cn('object-contain', props.imgClassName)} />
        </div>
      ) : (
        <ImageMedia {...props} />
      )}
    </Tag>
  )
}
