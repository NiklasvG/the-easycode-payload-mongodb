import { expect, test } from '@playwright/test'

test.describe('complete initial server render', () => {
  // Content must be visible before hydration or streamed HTML replacement scripts run.
  test.use({ javaScriptEnabled: false })

  test('homepage includes navigation, hero, CMS blocks and footer without a loading shell', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBe(200)
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('article h1')).toBeVisible()
    await expect(page.locator('article > div').first()).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
    await expect(page.getByText('Inhalt wird geladen', { exact: false })).toHaveCount(0)
  })

  test('project details are visible without JavaScript', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const projectLink = page.locator('article a[href^="/projekte/"]').first()
    await expect(projectLink).toBeAttached()
    const href = await projectLink.getAttribute('href')
    expect(href).toBeTruthy()
    const response = await page.goto(href!, { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBe(200)
    await expect(page.locator('article h1')).toBeVisible()
    await expect(page.getByText('Projekt wird geladen', { exact: false })).toHaveCount(0)
    await expect(page.locator('footer')).toBeVisible()
  })
})
