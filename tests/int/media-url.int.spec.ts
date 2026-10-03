// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { getMediaUrl } from '@/utilities/getMediaUrl'

describe('media URLs for the Next image optimizer', () => {
  it('keeps local uploads relative, including their encoded cache tag', () => {
    expect(getMediaUrl('/api/media/file/logo.png', '2026-10-03T10:00:00Z'))
      .toBe('/api/media/file/logo.png?2026-10-03T10%3A00%3A00Z')
    expect(getMediaUrl('media/video.mp4')).toBe('/media/video.mp4')
  })

  it('preserves external media and existing query parameters', () => {
    expect(getMediaUrl('https://example.org/logo.png?size=large', 'v2'))
      .toBe('https://example.org/logo.png?size=large&v2')
  })

  it('returns an empty source for missing uploads', () => {
    expect(getMediaUrl(null)).toBe('')
    expect(getMediaUrl(undefined)).toBe('')
  })
})
