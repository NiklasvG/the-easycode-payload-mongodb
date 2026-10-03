export const getSitemapOrigin = () =>
  (process.env.NEXT_PUBLIC_SERVER_URL || 'https://the-easycode.eu').replace(/\/$/, '')
