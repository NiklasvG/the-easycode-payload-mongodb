import { createHmac, randomBytes } from 'node:crypto'
import { isIP } from 'node:net'

// Process-local defense in depth. Multi-replica deployments need shared edge limits.
export function createChatLimiter() {
  const secret = randomBytes(32)
  const clients = new Map<string, { count: number; expires: number }>()
  let minute = { count: 0, expires: 0 }
  let day = { count: 0, expires: 0 }
  let active = 0
  const timer = setInterval(() => {
    const now = Date.now()
    for (const [key, record] of clients) if (record.expires <= now) clients.delete(key)
  }, 15000)
  timer.unref()
  return {
    acquire(headers: Headers, now = Date.now()): { release: () => void } | { retryAfter: number } {
      if (now >= minute.expires) minute = { count: 0, expires: now + 60000 }
      if (now >= day.expires) day = { count: 0, expires: now + 86400000 }
      if (day.count >= 300)
        return { retryAfter: Math.max(1, Math.ceil((day.expires - now) / 1000)) }
      if (minute.count >= 30 || active >= 4) return { retryAfter: 60 }
      const header = process.env.PUBLIC_TRUSTED_CLIENT_IP_HEADER
      const ip = header ? headers.get(header)?.trim() : undefined
      if (!ip || !isIP(ip)) return { retryAfter: 60 }
      for (const [key, record] of clients) if (record.expires <= now) clients.delete(key)
      const key = createHmac('sha256', secret).update(ip).digest('hex')
      let record = clients.get(key)
      if (!record) {
        if (clients.size >= 2048) return { retryAfter: 60 }
        record = { count: 0, expires: now + 60000 }
        clients.set(key, record)
      }
      if (record.count >= 5)
        return { retryAfter: Math.max(1, Math.ceil((record.expires - now) / 1000)) }
      record.count++
      minute.count++
      day.count++
      active++
      let released = false
      return {
        release: () => {
          if (!released) {
            active--
            released = true
          }
        },
      }
    },
    dispose() {
      clearInterval(timer)
      clients.clear()
    },
  }
}
