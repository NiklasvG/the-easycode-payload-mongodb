import { getCachedLLMsIndex } from '@/utilities/llms'

export async function GET() {
  if (process.env.APP_ENV === 'staging') {
    return new Response('Not available on staging', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } })
  }
  return new Response(await getCachedLLMsIndex(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // CMS cache is invalidated by publishing hooks. Avoid an independent CDN cache.
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  })
}
