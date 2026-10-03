import { timingSafeEqual } from 'node:crypto'
import type { PayloadRequest } from 'payload'

export function runJobs({ req }: { req: PayloadRequest }): boolean {
  if (req.user) return true
  const secret = process.env.CRON_SECRET
  const authorization = req.headers.get('authorization')
  if (!secret || !authorization) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(authorization)
  return expected.length === received.length && timingSafeEqual(expected, received)
}
