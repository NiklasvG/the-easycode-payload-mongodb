import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { createConnection } from 'node:net'

const isolatedServer = process.env.PERF_START_SERVER === 'true'
const origin = process.env.PERF_ORIGIN || (isolatedServer ? 'http://localhost:3002' : 'http://localhost:3000')
const paths = (process.env.PERF_PATHS || '/,/projekte,/projekte/testkunde/testprojekt').split(',')
const runs = Number(process.env.PERF_RUNS || 3)
if (!Number.isInteger(runs) || runs < 1 || runs > 20) throw new Error('PERF_RUNS must be 1–20')
const address = new URL(origin)
const port = Number(address.port || 80)
if (isolatedServer && !['localhost', '127.0.0.1'].includes(address.hostname)) throw new Error('Owned server must use localhost')
const listening = () => new Promise((resolve) => {
  const socket = createConnection({ host: address.hostname, port })
  socket.once('connect', () => { socket.destroy(); resolve(true) })
  socket.once('error', () => resolve(false))
  socket.setTimeout(1000, () => { socket.destroy(); resolve(false) })
})
async function startServer() {
  if (await listening()) throw new Error(`Benchmark port ${port} is already in use`)
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--port', String(port)], { stdio: 'ignore', windowsHide: true })
  let exited = false
  server.once('exit', () => { exited = true })
  const deadline = Date.now() + 30000
  while (!await listening()) {
    if (exited || Date.now() > deadline) { server.kill(); throw new Error('Owned benchmark server did not start') }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  return async () => {
    if (!exited) await new Promise((resolve) => { server.once('exit', resolve); server.kill() })
  }
}
const browser = await chromium.launch()
const results = []
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    for (const path of paths) {
      for (let run = 1; run <= runs; run++) {
        console.log(`Measuring ${viewport.width}px ${path}, run ${run}/${runs}`)
        const stopServer = isolatedServer ? await startServer() : async () => {}
        const context = await browser.newContext({ viewport })
        try {
          const page = await context.newPage()
          await page.addInitScript(() => {
            window.__metrics = { lcp: null, cls: 0, interactions: {} }
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) window.__metrics.lcp = entry.startTime
            }).observe({ type: 'largest-contentful-paint', buffered: true })
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__metrics.cls += entry.value
            }).observe({ type: 'layout-shift', buffered: true })
            if (PerformanceObserver.supportedEntryTypes.includes('event')) new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) if (entry.interactionId) window.__metrics.interactions[entry.interactionId] = Math.max(window.__metrics.interactions[entry.interactionId] || 0, entry.duration)
            }).observe({ type: 'event', buffered: true, durationThreshold: 16 })
          })
          for (const cache of ['fresh-browser', 'repeat-browser']) {
            const response = await page.goto(new URL(path, origin).href, { waitUntil: 'networkidle' })
            if (!response?.ok()) throw new Error(`${path}: HTTP ${response?.status()}`)
            const metrics = await page.evaluate(() => {
              const navigation = performance.getEntriesByType('navigation')[0]
              const resources = performance.getEntriesByType('resource')
              return { lcp: window.__metrics.lcp, cls: window.__metrics.cls, ttfb: navigation.responseStart - navigation.requestStart, responseMs: navigation.responseEnd - navigation.requestStart, transferredBytes: navigation.transferSize + resources.reduce((sum, item) => sum + item.transferSize, 0) }
            })
            const decline = page.getByRole('button', { name: 'Alle ablehnen', exact: true })
            if (await decline.isVisible()) await decline.click()
            await page.getByRole('button', { name: 'KI-Chat öffnen', exact: true }).click()
            const acknowledge = page.getByRole('button', { name: 'Verstanden', exact: true })
            if (await acknowledge.isVisible()) await acknowledge.click()
            await page.getByRole('button', { name: 'Chatfenster schließen', exact: true }).click()
            await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
            const interactionMetrics = await page.evaluate(() => {
              const durations = Object.values(window.__metrics.interactions)
              return { labInteractionCandidateMs: durations.length ? Math.max(...durations) : null, recordedInteractions: durations.length }
            })
            results.push({ viewport, path, run, cache, server: isolatedServer && cache === 'fresh-browser' ? 'new-process' : 'running-process', ...metrics, ...interactionMetrics })
          }
          if (isolatedServer) {
            const warmContext = await browser.newContext({ viewport })
            try {
              const warm = await warmContext.newPage()
              await warm.goto(new URL(path, origin).href, { waitUntil: 'networkidle' })
              const timing = await warm.evaluate(() => { const nav = performance.getEntriesByType('navigation')[0]; return { ttfb: nav.responseStart - nav.requestStart, responseMs: nav.responseEnd - nav.requestStart } })
              results.push({ viewport, path, run, cache: 'fresh-browser', server: 'running-process', ...timing })
            } finally { await warmContext.close() }
          }
        } finally { await context.close(); await stopServer() }
      }
    }
  }
} finally { await browser.close() }
await mkdir('test-results', { recursive: true })
await writeFile('test-results/performance.json', JSON.stringify({ measuredAt: new Date().toISOString(), origin, results, limitations: ['Unthrottled local Chromium', 'New process does not clear persistent data caches or OS caches', 'Scripted Event Timing is a lab candidate, not real-user INP', 'Event durations below 16 ms are not reported'] }, null, 2))
console.log('Performance report: test-results/performance.json')
