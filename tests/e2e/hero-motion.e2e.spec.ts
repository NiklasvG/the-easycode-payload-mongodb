import { expect, test } from '@playwright/test'

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
