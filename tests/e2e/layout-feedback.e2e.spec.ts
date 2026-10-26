import { expect, test } from '@playwright/test'

test('desktop navigation and footer preserve their restored visual states', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1000 })
  await page.goto('/projekte')
  const current = page.locator('.header-link[aria-current="page"]')
  const inactive = page.locator('.header-link').filter({ hasText: 'Leistungen' })
  expect(await current.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(
    'rgba(0, 0, 0, 0)',
  )
  await inactive.hover()
  await expect
    .poll(() => inactive.evaluate((el) => getComputedStyle(el).borderTopColor))
    .not.toBe('rgba(0, 0, 0, 0)')
  await expect(inactive).toHaveCSS('transition-duration', '0.25s, 0.25s, 0.25s')
  for (const width of [1280, 1920]) {
    await page.setViewportSize({ width, height: 1000 })
    const rows = await page
      .locator('footer .grid > div')
      .evaluateAll((elements) => elements.map((el) => Math.round(el.getBoundingClientRect().top)))
    expect(new Set(rows).size).toBe(1)
  }
})

test('pages and project details do not display breadcrumbs', async ({ page }) => {
  await page.goto('/projekte')
  await expect(page.getByRole('navigation', { name: 'Brotkrümelnavigation' })).toHaveCount(0)
  await page.goto('/leistungen/web-entwicklung')
  await expect(page.getByRole('navigation', { name: 'Brotkrümelnavigation' })).toHaveCount(0)
  await page.goto('/projekte/queo/enterprise-dashboard-angular-extjs-fuer-bmw')
  const breadcrumb = page.getByRole('navigation', { name: 'Brotkrümelnavigation' })
  const back = page.getByRole('link', { name: 'Alle Projekte', exact: true })
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await expect(breadcrumb).toHaveCount(0)
    await expect(back).toBeVisible()
  }
})
