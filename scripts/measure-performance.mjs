import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const origin = process.env.PERF_ORIGIN || 'http://localhost:3000'
const paths = (process.env.PERF_PATHS || '/,/projekte,/projekte/testkunde/testprojekt').split(',')
const runs = Number(process.env.PERF_RUNS || 3)
const browser = await chromium.launch()
const results = []
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    for (const path of paths) {
      for (let run = 1; run <= runs; run++) {
        const context = await browser.newContext({ viewport })
        const page = await context.newPage()
        await page.addInitScript(() => {
          window.__metrics = { lcp: null, cls: 0 }
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) window.__metrics.lcp = entry.startTime
          }).observe({ type: 'largest-contentful-paint', buffered: true })
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__metrics.cls += entry.value
          }).observe({ type: 'layout-shift', buffered: true })
        })
        for (const cache of ['fresh-browser', 'repeat-browser']) {
          const response = await page.goto(new URL(path, origin).href, { waitUntil: 'networkidle' })
          if (!response?.ok()) throw new Error(`${path}: HTTP ${response?.status()}`)
          const metrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0]
            const resources = performance.getEntriesByType('resource')
            return { ...window.__metrics, ttfb: navigation.responseStart - navigation.requestStart, transferredBytes: navigation.transferSize + resources.reduce((sum, item) => sum + item.transferSize, 0) }
          })
          results.push({ viewport, path, run, cache, ...metrics })
        }
        await context.close()
      }
    }
  }
} finally {
  await browser.close()
}
await mkdir('test-results', { recursive: true })
await writeFile('test-results/performance.json', JSON.stringify({ measuredAt: new Date().toISOString(), origin, results, limitations: ['Unthrottled local Chromium', 'Fresh browser is not a cold server cache', 'No real-user INP; use consent-enabled Umami for field measurements', 'No server restart between runs'] }, null, 2))
console.log('Performance report: test-results/performance.json')
