import { expect, test } from '@playwright/test'
import { lottieIconOptions } from '../../src/fields/lottieIcon'

test('Lottie icons load in sight and remain still with reduced motion', async ({ page, request }, testInfo) => {
  test.skip(process.env.TEST_DATABASE !== 'true', 'Requires isolated database')
  const { token } = await (await request.post('/api/users/login', { data: { email: 'editor@example.test', password: 'CI-editor-only-123!' } })).json()
  const headers = { Authorization: `JWT ${token}` }
  const slug = `animations-${Date.now()}`
  const response = await request.post('/api/pages', { headers, data: {
    title: 'Animation regression', slug, _status: 'published', hero: { type: 'none' },
    layout: [{ blockType: 'services', backgroundVariant: 'secondary', services: lottieIconOptions.map(({ value }) => ({ icon: value, headline: value, abstract: 'Animation regression', enableTeaserLink: false, link: { type: 'custom', label: value, url: '/projekte' } })) }],
  } })
  expect(response.ok(), await response.text()).toBe(true)
  const { doc } = await response.json()
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  try {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(`/${slug}`)
    const icons = page.locator('.service-card--icon > .service-card--icon')
    await expect(icons).toHaveCount(lottieIconOptions.length)
    await expect(icons.first().locator('svg')).toBeVisible()
    expect(await icons.last().locator('svg').count()).toBe(0)
    for (let index = 0; index < lottieIconOptions.length; index++) {
      await icons.nth(index).scrollIntoViewIfNeeded()
      await expect(icons.nth(index).locator('svg')).toBeVisible()
      await expect(icons.nth(index).locator('svg path').first()).toBeAttached()
    }
    const last = icons.last()
    const initial = await last.innerHTML()
    await last.hover()
    await page.evaluate(() => new Promise<void>((resolve) => { let frames = 0; const tick = () => ++frames >= 20 ? resolve() : requestAnimationFrame(tick); requestAnimationFrame(tick) }))
    expect(await last.innerHTML()).toBe(initial)
    await page.screenshot({ path: testInfo.outputPath('lottie-reduced-motion.png') })
    await page.setViewportSize({ width: 390, height: 844 })
    await icons.first().scrollIntoViewIfNeeded()
    await expect(icons.first().locator('svg')).toBeVisible()
    expect(errors).toEqual([])
  } finally { await request.delete(`/api/pages/${doc.id}`, { headers }) }
})

