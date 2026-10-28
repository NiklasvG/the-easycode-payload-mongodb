import { expect, test } from '@playwright/test'
import { writeFile } from 'node:fs/promises'

const missingPaths = [
  '/diese-seite-existiert-nicht-404-review',
  '/leistungen/404-review/unbekannt',
  '/posts/404-review-unbekannt',
  '/projekte/404-review/unbekannt',
  '/projekte/falscher-kunde/enterprise-dashboard-angular-extjs-fuer-bmw',
]
const illustration = 'main svg[viewBox="0 0 600 420"]'

test('all missing route types return an accessible 404 on mobile and desktop', async ({
  page,
}, testInfo) => {
  test.setTimeout(180000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const path of missingPaths) {
      const response = await page.goto(path)
      const decline = page.getByRole('button', { name: 'Alle ablehnen', exact: true })
      if (await decline.isVisible()) await decline.click()
      expect(response?.status(), path).toBe(404)
      await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
        'content',
        /noindex/,
      )
      await expect(
        page.getByRole('heading', { name: 'Seite nicht gefunden', exact: true }),
      ).toBeVisible()
      expect(await page.locator('main').count()).toBe(1)
      expect(await page.locator('main h1').count()).toBe(1)
      expect(await page.locator('a button, button a, a a').count()).toBe(0)
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true)
      for (const name of ['Zur Startseite', 'Zur Suche', 'Sag mir Bescheid.']) {
        const link = page.getByRole('main').getByRole('link', { name, exact: true })
        const box = await link.boundingBox()
        expect(box?.height).toBeGreaterThanOrEqual(44)
      }
    }
    await page.screenshot({
      path: testInfo.outputPath(`404-${width}.png`),
      fullPage: width === 320,
    })
  }
  expect(errors).toEqual([])
})

test('404 reflows with enlarged text and has a finite decorative animation', async ({
  page,
}, testInfo) => {
  for (const width of [320, 390, 768, 1920]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(missingPaths[0])
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%'
    })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      `${width}px at 200%`,
    ).toBe(true)
    await expect(
      page.getByRole('main').getByRole('link', { name: 'Zur Suche', exact: true }),
    ).toBeVisible()
    if (width === 320)
      await page.screenshot({ path: testInfo.outputPath('404-320-large-text.png'), fullPage: true })
  }
  await page.goto(missingPaths[0])
  const animation = await page.locator(illustration).evaluate((svg) => {
    const animation = svg.getAnimations({ subtree: true })[0]
    const timing = animation?.effect?.getTiming()
    return {
      count: svg.getAnimations({ subtree: true }).length,
      duration: timing?.duration,
      iterations: timing?.iterations,
    }
  })
  expect(animation).toEqual({ count: 1, duration: 1800, iterations: 1 })
  await expect
    .poll(() =>
      page
        .locator(illustration)
        .evaluate((svg) =>
          svg
            .getAnimations({ subtree: true })
            .every((animation) => animation.playState === 'finished'),
        ),
    )
    .toBe(true)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  expect(
    await page.locator(illustration).evaluate((svg) => svg.getAnimations({ subtree: true }).length),
  ).toBe(0)
})

test('keyboard users can skip to the 404 and recover via search and home', async ({ page }) => {
  await page.goto(missingPaths[0])
  const decline = page.getByRole('button', { name: 'Alle ablehnen', exact: true })
  if (await decline.isVisible()) await decline.click()
  await page.getByRole('link', { name: 'Zum Inhalt springen' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('main').getByRole('link', { name: 'Zur Startseite', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('main').getByRole('link', { name: 'Zur Suche', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/suche$/)
  await expect(page.getByRole('textbox', { name: 'Website durchsuchen' })).toBeVisible()
  await page.goto(missingPaths[0])
  await page.getByRole('main').getByRole('link', { name: 'Zur Startseite', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible()
})

test('known Next SSR limitation: 404 recovery without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()
  try {
    const response = await page.goto(missingPaths[0])
    expect(response?.status()).toBe(404)
    // Next 16.3.8 recovers thrown notFound() through client-side Flight data.
    // An unexpected pass flags a framework fix; retain the real HTTP 404.
    test.fail(true, 'Next 16.3.8 SSR error recovery emits an empty body before hydration')
    await expect(
      page.getByRole('heading', { name: 'Seite nicht gefunden', exact: true }),
    ).toBeVisible()
    await page.getByRole('main').getByRole('link', { name: 'Zur Suche', exact: true }).click()
    await expect(page).toHaveURL(/\/suche$/)
    await expect(page.getByRole('textbox', { name: 'Website durchsuchen' })).toBeVisible()
  } finally {
    await context.close()
  }
})

test('404 keeps its layout stable while the illustration animates', async ({ page }, testInfo) => {
  const measurements = []
  await page.addInitScript(() => {
    const metrics = { cls: 0, lcp: 0 }
    Object.assign(window, { notFoundMetrics: metrics })
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number }
        if (!shift.hadRecentInput) metrics.cls += shift.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) metrics.lcp = entry.startTime
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  })
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(missingPaths[0])
    await expect
      .poll(() =>
        page
          .locator(illustration)
          .evaluate((svg) =>
            svg
              .getAnimations({ subtree: true })
              .every((animation) => animation.playState === 'finished'),
          ),
      )
      .toBe(true)
    const metrics = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const metrics = (window as unknown as { notFoundMetrics: { cls: number; lcp: number } })
        .notFoundMetrics
      return {
        ...metrics,
        ttfb: timing.responseStart - timing.requestStart,
        transferBytes: performance
          .getEntriesByType('resource')
          .reduce((sum, entry) => sum + (entry as PerformanceResourceTiming).transferSize, 0),
      }
    })
    expect(metrics.cls).toBeLessThanOrEqual(0.01)
    measurements.push({ width, ...metrics })
  }
  const path = testInfo.outputPath('404-lab.json')
  await writeFile(path, JSON.stringify(measurements, null, 2))
  await testInfo.attach('404-lab.json', { path, contentType: 'application/json' })
})
