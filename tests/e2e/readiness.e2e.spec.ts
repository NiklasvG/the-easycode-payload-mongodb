import { expect, test } from '@playwright/test'

test('container is ready and staging is excluded from indexing', async ({ request }) => {
  const response = await request.get('/api/health/ready')
  expect(response.status()).toBe(200)
  expect(await response.json()).toEqual({
    status: 'ready',
    ...(process.env.SOURCE_COMMIT ? { revision: process.env.SOURCE_COMMIT } : {}),
  })
  expect(response.headers()['cache-control']).toContain('no-store')
  const home = await request.get('/')
  expect(home.status()).toBe(200)
  if (process.env.APP_ENV === 'staging') {
    expect(home.headers()['x-robots-tag']).toBe('noindex, nofollow')
    expect(await (await request.get('/robots.txt')).text()).toMatch(/Disallow: \/\s/)
  }
})
