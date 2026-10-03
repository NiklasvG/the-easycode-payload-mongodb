import { isIP } from 'node:net'

export function createRequestLimiter(totalPerMinute: number, perClient: number) {
  let total = { count: 0, resetAt: 0 }
  const clients = new Map<string, { count: number; resetAt: number }>()
  return (headers: Headers, now = Date.now()): boolean => {
    if (now >= total.resetAt) total = { count: 0, resetAt: now + 60000 }
    if (++total.count > totalPerMinute) return false
    // Opt in only to a header that the deployment proxy overwrites, never arbitrary XFF.
    const header = process.env.PUBLIC_TRUSTED_CLIENT_IP_HEADER
    const ip = header ? headers.get(header)?.trim() : undefined
    if (!ip || !isIP(ip)) return true
    for (const [key, record] of clients) if (now >= record.resetAt) clients.delete(key)
    let record = clients.get(ip)
    if (!record) {
      if (clients.size >= 2048) return false
      record = { count: 0, resetAt: now + 60000 }
      clients.set(ip, record)
    }
    return ++record.count <= perClient
  }
}

export class RequestBodyError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export async function readLimitedJSON(
  request: Request,
  maxBytes = 65536,
  signal: AbortSignal = request.signal,
): Promise<unknown> {
  const length = request.headers.get('content-length')
  if (length && (!/^\d+$/.test(length) || Number(length) > maxBytes))
    throw new RequestBodyError(413, 'Request too large')
  if (!request.body) throw new RequestBodyError(400, 'Invalid JSON')
  const reader = request.body.getReader()
  const cancel = () => {
    void reader.cancel().catch(() => {})
  }
  signal.addEventListener('abort', cancel, { once: true })
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    if (signal.aborted) {
      cancel()
      throw new RequestBodyError(408, 'Request aborted')
    }
    while (true) {
      const { value, done } = await reader.read()
      if (signal.aborted) throw new RequestBodyError(408, 'Request aborted')
      if (done) break
      size += value.byteLength
      if (size > maxBytes) {
        await reader.cancel()
        throw new RequestBodyError(413, 'Request too large')
      }
      chunks.push(value)
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
  } catch (error) {
    if (error instanceof RequestBodyError) throw error
    throw new RequestBodyError(400, 'Invalid JSON')
  } finally {
    signal.removeEventListener('abort', cancel)
    reader.releaseLock()
  }
}

export function hasAllowedOrigin(request: { headers: Headers; url?: string }): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true // Non-browser integrations still undergo authorization/validation.
  const allowed =
    process.env.NEXT_PUBLIC_SERVER_URL || (request.url ? new URL(request.url).origin : '')
  return origin === new URL(allowed || 'http://localhost:3000').origin
}
