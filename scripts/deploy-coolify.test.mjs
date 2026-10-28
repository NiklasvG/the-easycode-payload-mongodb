import { test } from 'node:test'
import assert from 'node:assert/strict'
import { deploy } from './deploy-coolify.mjs'
import { assertTestEnvironment } from './assert-test-environment.mjs'

const sha = 'a'.repeat(40)
const env = {
  COOLIFY_URL: 'https://coolify.example.test',
  COOLIFY_APPLICATION_UUID: 'website',
  COOLIFY_TOKEN: 'private-token',
  DEPLOY_PUBLIC_URL: 'https://staging.example.test',
  GITHUB_SHA: sha,
  GITHUB_REPOSITORY: 'team/site',
  GH_TOKEN: 'github-token',
}
function harness({
  head = sha,
  status = 'finished',
  commit = sha,
  auto = false,
  ready = 200,
  failPatch = false,
  pinned = sha,
  imageTag = sha,
  publicRevision = sha,
  builder = true,
} = {}) {
  const calls = []
  const records = []
  let patched = false
  const app = {
    git_repository: 'team/site',
    git_branch: 'main',
    build_pack: 'dockerfile',
    settings: { is_auto_deploy_enabled: auto, is_build_server_enabled: builder },
    docker_registry_image_name: 'registry.example.test/website',
    fqdn: env.DEPLOY_PUBLIC_URL,
  }
  return {
    calls,
    records,
    options: {
      now: () => 0,
      sleep: async () => {
        throw new Error('deadline test')
      },
      record: async (data) => {
        records.push({ ...data })
      },
      fetch: async (url, options = {}) => {
        const path = new URL(url).pathname
        calls.push({ path, ...options })
        if (path.endsWith('/git/ref/heads/main')) return Response.json({ object: { sha: head } })
        if (path === '/api/v1/applications/website') {
          if (options.method === 'PATCH') {
            if (failPatch) return new Response('private error details', { status: 403 })
            patched = true
            return Response.json({ uuid: 'website' })
          }
          return Response.json({
            ...app,
            git_commit_sha: patched ? pinned : 'HEAD',
            docker_registry_image_tag: patched ? imageTag : 'latest',
          })
        }
        if (path === '/api/v1/deploy')
          return Response.json({
            deployments: [{ resource_uuid: 'website', deployment_uuid: 'release' }],
          })
        if (path === '/api/v1/deployments/release')
          return Response.json({
            status,
            commit,
            logs: `exporting manifest sha256:${'b'.repeat(64)}`,
          })
        if (path === '/api/health/ready')
          return Response.json({ status: 'ready', revision: publicRevision }, { status: ready })
        if (path === '/') return new Response('<html><body>Website</body></html>')
        throw new Error(`Unexpected request ${path}`)
      },
    },
  }
}
test('pins the tested commit, forces CMS refresh, waits and verifies the public release', async () => {
  const h = harness()
  const result = await deploy(env, h.options)
  assert.equal(result.commit, sha)
  assert.equal(result.digest, `sha256:${'b'.repeat(64)}`)
  const patch = h.calls.find((call) => call.method === 'PATCH')
  assert.deepEqual(JSON.parse(patch.body), { git_commit_sha: sha, docker_registry_image_tag: sha })
  assert.deepEqual(JSON.parse(h.calls.find((call) => call.path === '/api/v1/deploy').body), {
    uuid: 'website',
    force: true,
  })
  assert.equal(
    h.calls.at(-1).headers,
    undefined,
    'Coolify credentials must never reach the public application',
  )
})
test('superseded commits never mutate Coolify', async () => {
  const h = harness({ head: 'c'.repeat(40) })
  assert.deepEqual(await deploy(env, h.options), { skipped: true })
  assert.equal(h.calls.length, 1)
})
for (const [label, options, pattern] of [
  ['automatic push deployment', { auto: true }, /automatic push/],
  ['missing dedicated builder', { builder: false }, /build server/],
  ['failed pin request', { failPatch: true }, /HTTP 403/],
  ['unretained pin', { pinned: 'HEAD' }, /retain/],
  ['unretained image tag', { imageTag: 'latest' }, /retain/],
])
  test(`does not deploy after ${label}`, async () => {
    const h = harness(options)
    await assert.rejects(deploy(env, h.options), pattern)
    assert.equal(
      h.calls.some((call) => call.path === '/api/v1/deploy'),
      false,
    )
  })
for (const [label, options, pattern] of [
  ['failed build', { status: 'failed' }, /not finish successfully/],
  ['cancelled deployment', { status: 'cancelled' }, /not finish successfully/],
  ['wrong deployed revision', { commit: 'd'.repeat(40) }, /differs/],
  ['unready public application', { ready: 503 }, /readiness/],
  ['old public application', { publicRevision: 'd'.repeat(40) }, /different revision/],
])
  test(`rejects ${label}`, async () => {
    const h = harness(options)
    await assert.rejects(deploy(env, h.options), pattern)
    assert.notEqual(h.records.at(-1).status, 'finished')
  })
test('missing secrets fail before any network request', async () => {
  const h = harness()
  await assert.rejects(deploy({ ...env, COOLIFY_TOKEN: '' }, h.options), /Missing COOLIFY_TOKEN/)
  assert.equal(h.calls.length, 0)
})

test('invalid API JSON cannot leak response contents through an error message', async () => {
  const h = harness()
  const request = h.options.fetch
  h.options.fetch = async (url, options) =>
    new URL(url).pathname.startsWith('/api/v1/')
      ? new Response(env.COOLIFY_TOKEN)
      : request(url, options)
  await assert.rejects(deploy(env, h.options), (error) => {
    assert.match(error.message, /invalid JSON/)
    assert.equal(error.message.includes(env.COOLIFY_TOKEN), false)
    return true
  })
})
test('polling stops at the deadline without cancelling the server job', async () => {
  const h = harness({ status: 'in_progress' })
  let elapsed = 0
  h.options.now = () => elapsed
  h.options.sleep = async () => {
    elapsed += 24 * 60 * 1000
  }
  await assert.rejects(deploy(env, h.options), /timed out/)
  assert.equal(h.records.at(-1).status, 'timed_out')
  assert.equal(
    h.calls.some((call) => call.path.endsWith('/cancel')),
    false,
  )
})
test('core fixtures cannot target a remote database or application', () => {
  const isolated = {
    TEST_DATABASE: 'true',
    TEST_MAILPIT: 'true',
    MONGODB_URI: 'mongodb://127.0.0.1:27017/easycode_test',
    SMTP_HOST: '127.0.0.1',
    SMTP_PORT: '1026',
    EMAIL_TRANSPORT: '',
    AI_CHAT_ENABLED: 'false',
    PAYLOAD_SECRET: 'test',
    PREVIEW_SECRET: 'test',
  }
  assert.doesNotThrow(() => assertTestEnvironment(isolated))
  for (const override of [
    { TEST_DATABASE: 'false' },
    { TEST_MAILPIT: 'false' },
    { MONGODB_URI: 'mongodb://db.example.test/easycode_test' },
    { MONGODB_URI: 'mongodb://localhost/production' },
    { PLAYWRIGHT_BASE_URL: 'https://staging.example.test' },
    { SMTP_HOST: 'smtp.example.test' },
  ]) {
    assert.throws(() => assertTestEnvironment({ ...isolated, ...override }))
  }
})
