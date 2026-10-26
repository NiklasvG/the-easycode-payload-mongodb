import React from 'react'
import { renderToString } from 'react-dom/server'
import { expect, it } from 'vitest'
import { Media } from '@/components/Media'
import type { Media as MediaResource } from '@/payload-types'

const resource = (values: Partial<MediaResource>) => ({
  id: 'local-media',
  createdAt: '2026-10-26T10:00:00Z',
  updatedAt: '2026-10-26T10:00:00Z',
  ...values,
})

function renderMedia(values: Partial<MediaResource>) {
  return new DOMParser().parseFromString(
    renderToString(React.createElement(Media, { resource: resource(values) })),
    'text/html',
  )
}

it('renders CMS PDFs as named downloads instead of passing documents to the image optimizer', () => {
  const html = renderMedia({
    mimeType: 'application/pdf',
    url: '/api/media/file/project.pdf',
    filename: 'project.pdf',
    alt: 'Projektbeschreibung',
  })
  const download = html.querySelector('a')!
  expect(download.textContent).toContain('PDF herunterladen: Projektbeschreibung')
  expect(download.getAttribute('href')).toContain('/api/media/file/project.pdf')
  expect(download.hasAttribute('download')).toBe(true)
  expect(html.querySelector('img')).toBeNull()
})

it('reserves a fallback frame for legacy CMS images whose dimensions are missing', () => {
  const html = renderMedia({
    mimeType: 'image/webp',
    url: '/api/media/file/legacy.webp',
    alt: 'Legacy CMS image',
  })
  const image = html.querySelector('img')!
  expect(image.getAttribute('alt')).toBe('Legacy CMS image')
  expect(image.getAttribute('data-nimg')).toBe('fill')
  expect(html.querySelector('.aspect-video')).toBeTruthy()
})

it('keeps intrinsic image dimensions when they are available', () => {
  const html = renderMedia({
    mimeType: 'image/webp',
    url: '/api/media/file/image.webp',
    width: 640,
    height: 480,
  })
  expect(html.querySelector('img')?.getAttribute('width')).toBe('640')
  expect(html.querySelector('img')?.getAttribute('height')).toBe('480')
})

it('provides native video controls without autoplay, a loop or an initial video download', () => {
  const html = renderMedia({
    mimeType: 'video/mp4',
    url: '/api/media/file/demo.mp4',
    width: 1280,
    height: 720,
    alt: 'Projektvideo',
  })
  const video = html.querySelector('video')!
  expect(video.hasAttribute('controls')).toBe(true)
  expect(video.hasAttribute('autoplay')).toBe(false)
  expect(video.hasAttribute('loop')).toBe(false)
  expect(video.getAttribute('preload')).toBe('none')
  expect(video.getAttribute('aria-label')).toBe('Projektvideo')
  expect(video.getAttribute('width')).toBe('1280')
  expect(video.getAttribute('height')).toBe('720')
})
