import { expect, test } from '@playwright/test'
import { readFile, writeFile } from 'node:fs/promises'

async function writeCSS(path: string, source: string) {
  for (let attempt = 0; ; attempt++) {
    try { await writeFile(path, source); return } catch (error) {
      if (attempt >= 10 || !['EBUSY', 'EPERM', 'UNKNOWN'].includes((error as NodeJS.ErrnoException).code || '')) throw error
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
}

test('development CSS hot reload preserves the current page', async ({ page }) => {
  test.skip(process.env.DEV_HMR_TEST !== 'true', 'Only deliberate local development validation')
  test.setTimeout(120000)
  const path = 'src/app/(frontend)/globals.css'
  const source = await readFile(path, 'utf8')
  try {
    await page.goto('/admin/login')
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible()
    await page.goto('/suche')
    const input = page.getByRole('textbox', { name: 'Website durchsuchen' })
    await expect(input).toBeVisible()
    await input.fill('HMR marker')
    await expect(page).toHaveURL(/q=HMR\+marker/)
    await page.evaluate(() => document.body.classList.add('quality-hmr-proof'))
    await writeCSS(path, `${source}\n.quality-hmr-proof { --quality-hmr-value: 1; }\n`)
    await page.waitForFunction(() => getComputedStyle(document.body).getPropertyValue('--quality-hmr-value').trim() === '1')
    await writeCSS(path, `${source}\n.quality-hmr-proof { --quality-hmr-value: 2; }\n`)
    await page.waitForFunction(() => getComputedStyle(document.body).getPropertyValue('--quality-hmr-value').trim() === '2')
    await expect(input).toHaveValue('HMR marker')
  } finally { await writeCSS(path, source) }
})
