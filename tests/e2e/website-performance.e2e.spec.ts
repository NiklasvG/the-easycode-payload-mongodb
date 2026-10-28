import { expect, test } from '@playwright/test'
import { writeFile } from 'node:fs/promises'

test('production lab timing and motion controls on representative pages', async ({
  browser,
  request,
}, testInfo) => {
  test.setTimeout(120000)
  const projects = await (await request.get('/api/projects?limit=1&depth=1')).json()
  const project = projects.docs[0]
  const detail = project?.client?.slug ? `/projekte/${project.client.slug}/${project.slug}` : null
  const results: unknown[] = []
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } })
    const page = await context.newPage()
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (entry) => {
      if (entry.type() === 'error') errors.push(entry.text())
    })
    await page.addInitScript(() => {
      const metrics = { lcp: 0, cls: 0 }
      Object.assign(window, { auditMetrics: metrics })
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) metrics.lcp = entry.startTime
      }).observe({ type: 'largest-contentful-paint', buffered: true })
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & {
          hadRecentInput: boolean
          value: number
        })[]) {
          if (!entry.hadRecentInput) metrics.cls += entry.value
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })
    for (const path of ['/', '/projekte', ...(detail ? [detail] : [])]) {
      await page.goto(path, { waitUntil: 'networkidle' })
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType(
          'navigation',
        )[0] as PerformanceNavigationTiming
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
        return {
          ...(window as unknown as { auditMetrics: { lcp: number; cls: number } }).auditMetrics,
          ttfb: navigation.responseStart - navigation.requestStart,
          transferredBytes:
            navigation.transferSize +
            resources.reduce((sum, resource) => sum + resource.transferSize, 0),
        }
      })
      results.push({ width, path, ...metrics })
      await page.screenshot({
        path: testInfo.outputPath(
          `${width}-${path === '/' ? 'home' : path === '/projekte' ? 'projects' : 'project-detail'}.png`,
        ),
        fullPage: false,
      })
      expect.soft(metrics.cls, `${path} at ${width}px`).toBeLessThan(0.1)
      if (path === '/') {
        await page.getByRole('button', { name: 'Alle ablehnen', exact: true }).click()
        const logoPause = page.getByRole('button', { name: 'Kundenlogos pausieren', exact: true })
        if (await logoPause.count()) {
          await logoPause.click()
          await expect(
            page.getByRole('button', { name: 'Kundenlogos fortsetzen', exact: true }),
          ).toHaveAttribute('aria-pressed', 'true')
        }
      }
    }
    expect(errors).toEqual([])
    await context.close()
  }
  const report = JSON.stringify(
    {
      limitations:
        'Unthrottled local Chromium; no production field metrics, no before/after speed claim.',
      results,
    },
    null,
    2,
  )
  const reportPath = testInfo.outputPath('local-lab-metrics.json')
  await writeFile(reportPath, report)
  await testInfo.attach('local-lab-metrics.json', {
    path: reportPath,
    contentType: 'application/json',
  })
})
