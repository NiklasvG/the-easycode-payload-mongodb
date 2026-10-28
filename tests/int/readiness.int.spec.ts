// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
const { command, getPayload } = vi.hoisted(() => ({ command: vi.fn(), getPayload: vi.fn() }))
vi.mock('payload', () => ({ getPayload }))
vi.mock('@payload-config', () => ({ default: {} }))
import { GET } from '@/app/api/health/ready/route'

beforeEach(() => {
  vi.unstubAllEnvs()
  vi.stubEnv('SOURCE_COMMIT', '')
  command.mockReset().mockResolvedValue({ ok: 1 })
  getPayload.mockReset().mockResolvedValue({
    db: { connection: { readyState: 1, db: { admin: () => ({ command }) } } },
  })
})
it('identifies the runtime revision without exposing arbitrary environment values', async () => {
  vi.stubEnv('SOURCE_COMMIT', 'a'.repeat(40))
  expect(await (await GET()).json()).toEqual({ status: 'ready', revision: 'a'.repeat(40) })
  vi.stubEnv('SOURCE_COMMIT', 'private environment value')
  expect(await (await GET()).json()).toEqual({ status: 'ready' })
})
it('checks the database on every request and disables caching', async () => {
  for (let index = 0; index < 2; index++) {
    const response = await GET()
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'ready' })
    expect(response.headers.get('cache-control')).toBe('no-store')
  }
  expect(command).toHaveBeenCalledTimes(2)
})
it('reports database failure without revealing connection details', async () => {
  command.mockRejectedValue(new Error('mongodb://private:secret@database'))
  const response = await GET()
  expect(response.status).toBe(503)
  expect(await response.json()).toEqual({ status: 'unavailable' })
})
it('reports incomplete startup as unavailable', async () => {
  getPayload.mockResolvedValue({ db: { connection: { readyState: 0 } } })
  expect((await GET()).status).toBe(503)
  expect(command).not.toHaveBeenCalled()
})
