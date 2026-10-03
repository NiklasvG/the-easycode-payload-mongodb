import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
	test('can go on homepage', async ({ page }, testInfo) => {
		const browserErrors: string[] = []
		page.on('pageerror', (error) => browserErrors.push(error.message))
		await page.goto('http://localhost:3000')

		await expect(page).toHaveTitle(/The-EasyCode/)

		const heading = page.locator('h1').first()

		// The CMS hero rotates its opening phrase; the location stays constant.
		await expect(heading).toContainText('Dresden')
		await expect(heading).toBeVisible()
		const declineCookies = page.getByRole('button', { name: 'Alle ablehnen', exact: true })
		await declineCookies.click()
		await expect(declineCookies).not.toBeVisible()
		await expect(heading.locator('span').first()).toHaveCSS('opacity', '1')
		await page.screenshot({ path: testInfo.outputPath('desktop.png') })
		await page.setViewportSize({ width: 390, height: 844 })
		await expect(heading).toBeVisible()
		await page.screenshot({ path: testInfo.outputPath('mobile.png') })
		expect(browserErrors).toEqual([])
	})
})
