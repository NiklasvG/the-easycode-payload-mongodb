import { timingSafeEqual } from 'node:crypto'
import { isIP } from 'node:net'

export const runtime = 'nodejs'

// Temporary staging diagnostic. No provider/CMS calls or request logging.
export function GET(request: Request) {
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
  const token = process.env.CHAT_PROXY_DIAGNOSTIC_TOKEN || ''
  const expires = Date.parse(process.env.CHAT_PROXY_DIAGNOSTIC_UNTIL || '')
  const now = Date.now()
  if (
    process.env.APP_ENV !== 'staging' ||
    token.length < 32 ||
    !Number.isFinite(expires) ||
    expires <= now ||
    expires - now > 3600000
  )
    return new Response(null, { status: 404, headers })

  const supplied = request.headers.get('x-proxy-diagnostic-token') || ''
  const expectedBytes = Buffer.from(token)
  const suppliedBytes = Buffer.from(supplied)
  if (
    suppliedBytes.length !== expectedBytes.length ||
    !timingSafeEqual(expectedBytes, suppliedBytes)
  )
    return new Response(null, { status: 404, headers })

  const header = process.env.PUBLIC_TRUSTED_CLIENT_IP_HEADER || ''
  const ip = header ? request.headers.get(header)?.trim() : undefined
  return Response.json(
    {
      header,
      validClientIp: Boolean(ip && isIP(ip)),
      testAddressAccepted: ip === '192.0.2.123' || ip === '2001:db8::123',
    },
    { headers },
  )
}
