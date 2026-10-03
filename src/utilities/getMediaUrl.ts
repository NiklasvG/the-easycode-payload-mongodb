/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  // Keep local uploads relative so Next's image optimizer handles them internally.
  // Absolute localhost URLs are rejected by Next 16's private-IP protection.
  const mediaUrl = /^https?:\/\//.test(url) || url.startsWith('/') ? url : `/${url}`
  const separator = mediaUrl.includes('?') ? '&' : '?'
  return cacheTag ? `${mediaUrl}${separator}${cacheTag}` : mediaUrl
}
