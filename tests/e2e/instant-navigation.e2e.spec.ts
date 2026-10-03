import { expect, test } from '@playwright/test'
import { instant } from '@next/playwright'

test.describe('instant project navigation', () => {
  test.skip(process.env.NEXT_INSTANT_TEST !== 'true', 'Testing API only in isolated builds')
  test('direct visit has a shell before dynamic CMS content', async ({ page, baseURL }) => {
    await instant(page, async () => {
      await page.goto('/projekte/testkunde/testprojekt')
      await expect(page.getByRole('status')).toContainText('Projekt wird geladen')
    }, { baseURL })
    await expect(page.getByRole('heading', { level: 1, name: 'Testprojekt', exact: true })).toBeVisible()
  })
  test('overview navigation commits its prefetched shell and streams the project', async ({ page }) => {
    await page.goto('/projekte')
    const link = page.locator('a[href="/projekte/testkunde/testprojekt"]').first()
    await expect(link).toBeVisible()
    await link.hover()
    await instant(page, async () => {
      await link.click()
      await page.waitForURL('**/projekte/testkunde/testprojekt')
      await expect(page.getByRole('status')).toContainText('Projekt wird geladen')
    })
    await expect(page.getByRole('heading', { level: 1, name: 'Testprojekt', exact: true })).toBeVisible()
  })
})
