import { describe, expect, it } from 'vitest'
import { MAX_MEDIA_BYTES, validateMediaUpload } from '@/hooks/validateMediaUpload'

describe('media size policy', () => {
  it('rejects oversized files before processing', () => {
    expect(() => validateMediaUpload({ operation: 'create', args: {}, req: { file: { size: MAX_MEDIA_BYTES + 1 } } } as unknown as Parameters<typeof validateMediaUpload>[0])).toThrow('20 MiB')
  })
  it('permits metadata updates without a file', () => {
    const args = { data: { alt: 'Updated' } }
    expect(validateMediaUpload({ operation: 'update', args, req: {} } as unknown as Parameters<typeof validateMediaUpload>[0])).toBe(args)
  })
})
