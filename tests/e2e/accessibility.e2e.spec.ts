import { expect, test } from '@playwright/test'

test('mobile navigation manages focus, Escape and scroll locking', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Alle ablehnen', exact: true }).click()
  const open = page.getByRole('button', { name: 'Menü öffnen' })
  await open.click()
  const dialog = page.getByRole('dialog', { name: 'Navigation', exact: true })
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Tab')
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(open).toBeFocused()
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
})

test('representative pages remain usable on narrow screens and with large text', async ({
  page,
}) => {
  for (const width of [320, 1024]) {
    await page.setViewportSize({ width, height: 900 })
    for (const path of ['/', '/projekte', '/kontakt', '/leistungen/web-entwicklung']) {
      await page.goto(path)
      const decline = page.getByRole('button', { name: 'Alle ablehnen', exact: true })
      if (await decline.isVisible()) await decline.click()
      await expect(page.getByRole('main')).toBeVisible()
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${path} at ${width}px`,
      ).toBe(true)
    }
  }
  await page.setViewportSize({ width: 390, height: 600 })
  await page.goto('/kontakt')
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%'
  })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  )
  await page.evaluate(() => window.dispatchEvent(new Event('show-cookie-banner')))
  const confirm = page.getByRole('button', { name: 'Auswahl bestätigen' })
  // Large text intentionally scrolls inside the banner; its actions must remain reachable.
  await confirm.scrollIntoViewIfNeeded()
  await expect(confirm).toBeInViewport()
  await confirm.click()
  await expect(page.getByRole('region', { name: 'Cookie-Einstellungen' })).not.toBeVisible()
})

test('keyboard users can skip navigation and recover from a missing page', async ({ page }) => {
  const response = await page.goto('/ci-missing-page')
  expect(response?.status()).toBe(404)
  await page.getByRole('button', { name: 'Alle ablehnen', exact: true }).click()
  const skip = page.getByRole('link', { name: 'Zum Inhalt springen' })
  await skip.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  await expect(
    page.getByRole('heading', { name: 'Seite nicht gefunden', exact: true }),
  ).toBeVisible()
  await page.getByRole('main').getByRole('link', { name: 'Zur Suche', exact: true }).click()
  await expect(page.getByRole('textbox', { name: 'Website durchsuchen' })).toBeVisible()
})
