// @vitest-environment node
import { expect, it, vi } from 'vitest'
import type { PayloadRequest } from 'payload'
import { limitAuthentication } from '@/hooks/limitAuthentication'
it('bounds anonymous auth and reset operations without limiting authorized editor work', () => {
  vi.stubEnv('PUBLIC_TRUSTED_CLIENT_IP_HEADER', '')
  const req = { headers: new Headers(), user: null } as unknown as PayloadRequest
  const call = (operation: Parameters<typeof limitAuthentication>[0]['operation'], request = req) => limitAuthentication({ args: { req: request }, operation, req: request } as unknown as Parameters<typeof limitAuthentication>[0])
  for (let attempt = 0; attempt < 60; attempt++) call('login')
  expect(() => call('forgotPassword')).toThrow('Too many authentication attempts')
  expect(() => call('resetPassword')).toThrow('Too many authentication attempts')
  expect(() => call('update')).not.toThrow()
  expect(() => call('login', { ...req, user: { id: 'editor' } } as PayloadRequest)).not.toThrow()
  vi.unstubAllEnvs()
})
