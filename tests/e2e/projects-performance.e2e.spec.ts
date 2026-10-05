import { expect, test } from '@playwright/test'

test('project filters keep matching cards, accessible contrast and restore all projects', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/projekte')
  await page.getByRole('button', { name: 'Alle ablehnen', exact: true }).click()
  const filters = page.locator('main button[aria-pressed]')
  const cards = page.locator('main .service-card')
  await expect(filters.first()).toBeVisible()
  await expect(cards.first()).toBeVisible()
  const total = await cards.count()
  expect(total).toBeGreaterThan(1)
  expect(await filters.count()).toBeGreaterThan(2)

  for (let index = 1; index < await filters.count(); index++) {
    const filter = filters.nth(index)
    const label = (await filter.innerText()).trim()
    await filter.click()
    await expect(filter).toHaveAttribute('aria-pressed', 'true')
    await expect(cards.locator('.list--tag li.highlight').filter({ hasNotText: label })).toHaveCount(0)
    expect(await cards.count()).toBeGreaterThan(0)
    expect(await cards.count()).toBeLessThan(total)
    const contrast = await filter.evaluate((element) => {
      const style = getComputedStyle(element)
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 1
      const context = canvas.getContext('2d')!
      const luminance = (color: string) => {
        context.fillStyle = color
        context.fillRect(0, 0, 1, 1)
        const rgb = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map((value) => {
          const channel = value / 255
          return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
        })
        return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722
      }
      const foreground = luminance(style.color)
      const background = luminance(style.backgroundColor)
      return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05)
    })
    expect(contrast).toBeGreaterThanOrEqual(4.5)
  }

  await filters.first().click()
  await expect(filters.first()).toHaveAttribute('aria-pressed', 'true')
  await expect(cards).toHaveCount(total)
  expect(errors).toEqual([])
})

test('mobile images match display density and content is visible without JavaScript', async ({ browser }) => {
  for (const deviceScaleFactor of [1, 1.75, 3]) {
    const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor })
    const page = await context.newPage()
    const imageResponse = page.waitForResponse((response) =>
      response.request().resourceType() === 'image' && response.url().includes('/_next/image'),
    )
    await page.goto('/projekte')
    expect((await imageResponse).headers()['content-type']).toBe('image/avif')
    const hero = page.locator('main section img').first()
    await expect(hero).toHaveAttribute('fetchpriority', 'high')
    await expect(hero).toHaveAttribute('loading', 'eager')
    for (const image of [hero, page.locator('main .service-card img').first()]) {
      await image.scrollIntoViewIfNeeded()
      await image.evaluate((element: HTMLImageElement) => element.decode())
      const size = await image.evaluate((element: HTMLImageElement) => ({
        candidate: Number(new URL(element.currentSrc).searchParams.get('w')),
        displayed: element.getBoundingClientRect().width,
      }))
      const requiredWidth = size.displayed * deviceScaleFactor
      expect(size.candidate).toBeGreaterThanOrEqual(requiredWidth)
      expect(size.candidate).toBeLessThanOrEqual(requiredWidth * 1.15)
    }
    await context.close()
  }

  const noJS = await browser.newContext({ javaScriptEnabled: false })
  const staticPage = await noJS.newPage()
  await staticPage.goto('/projekte')
  await expect(staticPage.locator('main h1')).toBeVisible()
  await expect(staticPage.locator('main h1 span').first()).toHaveCSS('opacity', '1')
  await expect(staticPage.locator('main .service-card').first()).toBeVisible()
  await expect(staticPage.locator('main .service-card').first().locator('..')).toHaveCSS('opacity', '1')
  await noJS.close()
})

test('reduced motion keeps the hero phrase stable and disables icon parallax', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/projekte')
  const phrase = page.locator('.text-animation-hero h1 > .text-accent')
  const initialText = await phrase.innerText()
  await page.waitForTimeout(3200)
  await expect(phrase).toHaveText(initialText)
  await expect(page.locator('.hero-icons')).toHaveCSS('transform', 'none')
  await page.getByRole('button', { name: 'Alle ablehnen', exact: true }).click()
  await page.locator('main button[aria-pressed]').nth(1).click()
  await expect(page.locator('main .service-card').first().locator('..')).toHaveCSS('animation-name', 'none')
  await context.close()
})
