// Canonicals, structured data and sitemap always use the same origin.
export const getSitemapOrigin = () =>
  new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://the-easycode.eu').origin
