import { expect, test } from '@playwright/test'

test.use({ reducedMotion: 'reduce' })

test('public homepage has landmarks, legal slider roles and correctly sized priority images', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  // Exercise the chat UI independently of runtime provider configuration and credentials.
  await page.route('**/api/ai-chat', async (route) => {
    expect(route.request().method()).toBe('GET')
    await route.fulfill({ json: { available: true } })
  })
  await page.goto('/')
  await expect(page.getByRole('main')).toHaveCount(1)
  await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('[role="representation"], li[role="group"], li[role="tabpanel"]')).toHaveCount(0)

  const logo = page.locator('header img').first()
  await expect(logo).toBeVisible()
  await logo.evaluate((image: HTMLImageElement) => image.decode())
  const ratios = await logo.evaluate((image: HTMLImageElement) => ({
    actual: image.naturalWidth / image.naturalHeight,
    rendered: image.getBoundingClientRect().width / image.getBoundingClientRect().height,
  }))
  expect(Math.abs(ratios.actual - ratios.rendered)).toBeLessThan(0.02)
  const hero = page.locator('main article section picture img').first()
  await expect(hero).toHaveAttribute('fetchpriority', 'high')
  await expect(hero).toHaveAttribute('loading', 'eager')

  await page.getByRole('button', { name: 'Alle ablehnen', exact: true }).click()
  await expect(page.getByRole('region', { name: 'EasyCode AI Chat', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'KI-Chat öffnen', exact: true }).click()
  await expect(page.getByRole('region', { name: 'EasyCode AI Chat', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Chatfenster schließen', exact: true }).click()
  await expect(page.getByRole('region', { name: 'EasyCode AI Chat', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'KI-Chat öffnen', exact: true }).click()
  await expect(page.getByRole('region', { name: 'EasyCode AI Chat', exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test('unavailable chat shows a contact fallback without opening the chat', async ({ page }) => {
  await page.route('**/api/ai-chat', async (route) => {
    expect(route.request().method()).toBe('GET')
    await route.fulfill({ json: { available: false } })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Alle ablehnen', exact: true }).click()
  await page.getByRole('button', { name: 'KI-Chat öffnen', exact: true }).click()
  const notice = page.getByRole('status').filter({ hasText: 'Der KI-Chat ist momentan nicht verfügbar.' })
  await expect(notice).toBeVisible()
  await expect(notice.getByRole('link', { name: 'E-Mail', exact: true })).toHaveAttribute(
    'href',
    'mailto:info@the-easycode.eu',
  )
  await expect(page.getByRole('region', { name: 'EasyCode AI Chat', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Hinweis schließen', exact: true }).click()
  await expect(notice).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'KI-Chat öffnen', exact: true })).toBeEnabled()
})

test('quote navigation updates the active quote without duplicate slides', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Alle ablehnen', exact: true }).click()
  const quotes = page.getByRole('region', { name: 'Kundenstimmen', exact: true })
  await expect(quotes).toBeVisible()
  await expect(quotes.locator('.splide__slide--clone')).toHaveCount(0)
  const dots = page.getByRole('button', { name: /^Gehe zu Zitat / })
  if (process.env.TEST_DATABASE === 'true') {
    await expect(dots).toHaveCount(2)
  }
  const count = await dots.count()
  expect(count).toBeGreaterThan(0)
  await expect(dots.first()).toHaveAttribute('aria-current', 'true')
  if (count > 1) {
    await page.getByRole('button', { name: 'Nächstes Zitat', exact: true }).click()
    await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true')
    await expect(quotes.locator('.splide__slide.is-active')).toHaveAttribute('aria-label', `2 of ${count}`)
    await page.getByRole('button', { name: 'Vorheriges Zitat', exact: true }).click()
    await expect(dots.first()).toHaveAttribute('aria-current', 'true')
    await dots.last().click()
    await expect(dots.last()).toHaveAttribute('aria-current', 'true')
    await page.getByRole('button', { name: 'Nächstes Zitat', exact: true }).click()
    await expect(dots.first()).toHaveAttribute('aria-current', 'true')
  }
})
