import { spawn, execFileSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'

const image = process.env.BUILD_BENCH_IMAGE || 'easycode-build-input'
const runs = Number(process.env.BUILD_BENCH_RUNS || 3)
if (!Number.isInteger(runs) || runs < 2 || runs > 10) throw new Error('BUILD_BENCH_RUNS must be 2–10')
const prefix = `easycode-bench-${Date.now()}`
const docker = (...args) => execFileSync('docker', args, { encoding: 'utf8', windowsHide: true }).trim()
const results = []
for (const bundler of ['webpack', 'turbopack']) {
  const volume = `${prefix}-${bundler}`
  docker('volume', 'create', volume)
  try {
    for (let run = 1; run <= runs; run++) {
      const name = `${volume}-${run}`
      docker('create', '--name', name, '--network', 'none', '--mount', `type=volume,src=${volume},dst=/app/.next/cache`,
        '-e', 'MONGODB_URI=mongodb://127.0.0.1:27017/build-only', '-e', 'PAYLOAD_SECRET=build-only-secret-not-used-at-runtime',
        '-e', 'AI_CHAT_ENABLED=false', '-e', 'EMAIL_TRANSPORT=json', '-e', 'SMTP_PORT=587',
        '-e', 'NEXT_PUBLIC_SERVER_URL=http://localhost:3000', '-e', 'APP_ENV=staging', image,
        'pnpm', 'exec', 'next', 'build', `--${bundler}`)
      let peakMemoryMiB = 0
      const started = performance.now()
      try {
        const child = spawn('docker', ['start', '--attach', name], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
        let log = ''
        child.stdout.on('data', (chunk) => { log += chunk })
        child.stderr.on('data', (chunk) => { log += chunk })
        const sample = setInterval(() => {
          try {
            const usage = docker('stats', '--no-stream', '--format', '{{.MemUsage}}', name).split('/')[0].trim()
            const match = usage.match(/^([\d.]+)([KMG]i?B)$/)
            if (match) {
              const multiplier = { KiB: 1 / 1024, MiB: 1, GiB: 1024, KB: 1 / 1000, MB: 1, GB: 1000 }[match[2]]
              peakMemoryMiB = Math.max(peakMemoryMiB, Number(match[1]) * multiplier)
            }
          } catch { /* Container may finish between samples. */ }
        }, 2000)
        const exitCode = await new Promise((resolve, reject) => { child.once('exit', resolve); child.once('error', reject) }).finally(() => clearInterval(sample))
        const durationSeconds = (performance.now() - started) / 1000
        await mkdir('test-results', { recursive: true })
        await writeFile(`test-results/build-${bundler}-${run}.log`, log)
        if (exitCode !== 0) throw new Error(`${bundler} build ${run} failed; see test-results/build-${bundler}-${run}.log`)
        const result = { bundler, run, cache: run === 1 ? 'empty-build-cache' : 'retained-build-cache', durationSeconds, peakMemoryMiB }
        results.push(result)
        console.log(JSON.stringify(result))
      } finally { docker('rm', '-f', name) }
    }
  } finally { docker('volume', 'rm', volume) }
}
await writeFile('test-results/build-comparison.json', JSON.stringify({ measuredAt: new Date().toISOString(), image, results, limitations: ['Sequential Linux containers on the same Docker host', 'Memory is sampled container usage, not process RSS', 'Dependency image and operating-system caches remain warm', 'Build-cache volume retained after first run'] }, null, 2))
