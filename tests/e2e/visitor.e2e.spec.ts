import { test, expect } from '@playwright/test'

test.describe('isolated visitor flows', () => {
  test.skip(process.env.TEST_DATABASE !== 'true', 'Requires reproducible test seed')
  test('project overview, detail, search and redirect', async ({ page }) => {
    await page.goto('/projekte')
    await page.getByRole('button', { name: 'Alle ablehnen', exact: true }).click()
    await page.locator('a[href="/projekte/testkunde/testprojekt"]').first().click()
    await expect(page).toHaveURL(/\/projekte\/testkunde\/testprojekt$/)
    await expect(page.getByRole('heading', { name: 'Testprojekt', exact: true }).first()).toBeVisible()
    await page.goto('/suche?q=Testprojekt')
    await expect(page.locator('a[href="/projekte/testkunde/testprojekt"]').first()).toBeVisible()
    await page.goto('/altes-projekt')
    await expect(page).toHaveURL(/\/projekte\/testkunde\/testprojekt$/)
  })
  test('mobile navigation opens, navigates and unlocks scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Alle ablehnen', exact: true }).click()
    await page.getByRole('button', { name: 'Menü öffnen' }).click()
    await expect(page.getByRole('button', { name: 'Menü schließen' }).first()).toHaveAttribute('aria-expanded', 'true')
    await page.locator('.nav-main__link--1').filter({ hasText: 'Projekte' }).click()
    await expect(page).toHaveURL(/\/projekte$/)
    await expect(page.getByRole('button', { name: 'Menü öffnen' })).toBeVisible()
  })
  test('consent accepts, persists and can be revoked', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('script[data-website-id]')).toHaveCount(0)
    await page.getByRole('button', { name: 'Alle akzeptieren', exact: true }).click()
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('cookie-consent-settings') || '{}').analytics)).toBe(true)
    await page.evaluate(() => window.dispatchEvent(new Event('show-cookie-banner')))
    await page.getByRole('checkbox').filter({ visible: true }).last().click()
    await page.getByRole('button', { name: 'Auswahl bestätigen' }).click()
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('cookie-consent-settings') || '{}').analytics)).toBe(false)
  })
})

