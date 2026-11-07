import { expect, test } from '@playwright/test'

for (const width of [1024, 1280, 1440, 1700, 1920, 2560]) {
  test(`hero stays in place when the header hydrates at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    // Hold hydration until the server-rendered layout has been painted.
    let releaseScripts!: () => void
    const scriptsReady = new Promise<void>((resolve) => {
      releaseScripts = resolve
    })
    await page.route('**/*.js*', async (route) => {
      await scriptsReady
      await route.continue()
    })
    const hero = page.locator('.text-animation-hero')
    const image = hero.locator('img').first()
    try {
      await page.goto('/', { waitUntil: 'commit' })
      await expect(image).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      const beforeHero = await hero.boundingBox()
      const beforeImage = await image.boundingBox()
      expect(beforeHero).not.toBeNull()
      expect(beforeImage).not.toBeNull()

      releaseScripts()
      await page.waitForFunction(() =>
        document.documentElement.style.getPropertyValue('--site-header-height'),
      )
      // Allow the ResizeObserver and the resulting layout to settle.
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      )
      const afterHero = (await hero.boundingBox())!
      const afterImage = (await image.boundingBox())!
      expect(Math.abs(afterHero.height - beforeHero!.height)).toBeLessThan(1)
      expect(Math.abs(afterImage.y - beforeImage!.y)).toBeLessThan(1)
    } finally {
      releaseScripts()
    }
  })
}

test('hero text visibly slides and fades without a pause control', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Alle ablehnen', exact: true }).click()
  await page.locator('.hero-heading').hover()
  await expect(page.locator('.hero-heading button')).toHaveCount(0)

  const phrase = page.locator('.hero-phrase')
  const first = await phrase.innerText()
  await page.waitForFunction(() => {
    const text = document.querySelector('.hero-phrase')
    if (!text) return false
    const style = getComputedStyle(text)
    const opacity = Number(style.opacity)
    return (
      opacity > 0 &&
      opacity < 0.98 &&
      style.transform !== 'none' &&
      style.transform !== 'matrix(1, 0, 0, 1, 0, 0)'
    )
  })
  await expect(phrase).not.toHaveText(first)
  await expect(phrase).toHaveCSS('opacity', '1')
  const clippingRoom = await phrase.evaluate((element) => {
    const window = element.parentElement!
    const style = getComputedStyle(window)
    return Number.parseFloat(style.paddingBottom) / Number.parseFloat(style.fontSize)
  })
  expect(clippingRoom).toBeGreaterThanOrEqual(0.19)
})

test('touch does not reveal a text control', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  const page = await context.newPage()
  await page.goto('/')
  await page.getByRole('button', { name: 'Alle ablehnen', exact: true }).tap()
  await page.locator('.hero-heading h1').tap()
  await expect(page.locator('.hero-heading button')).toHaveCount(0)
  await context.close()
})
