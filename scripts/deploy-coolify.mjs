import { writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function deploy(
  env,
  {
    fetch: request = fetch,
    sleep = delay,
    now = Date.now,
    record = async (data) => writeFile('deployment-record.json', JSON.stringify(data, null, 2)),
  } = {},
) {
  const required = [
    'COOLIFY_URL',
    'COOLIFY_APPLICATION_UUID',
    'COOLIFY_TOKEN',
    'DEPLOY_PUBLIC_URL',
    'GITHUB_SHA',
    'GITHUB_REPOSITORY',
    'GH_TOKEN',
  ]
  for (const name of required) if (!env[name]) throw new Error(`Missing ${name}`)
  if (!/^[a-f0-9]{40}$/.test(env.GITHUB_SHA)) throw new Error('Invalid commit SHA')
  if (!/^[a-zA-Z0-9_-]+$/.test(env.COOLIFY_APPLICATION_UUID))
    throw new Error('Invalid application UUID')
  const origin = new URL(env.COOLIFY_URL)
  const publicURL = new URL(env.DEPLOY_PUBLIC_URL)
  for (const url of [origin, publicURL]) {
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== '/'
    )
      throw new Error('Deployment URLs must be HTTPS origins')
  }
  const sha = env.GITHUB_SHA
  const api = async (path, method = 'GET', body) => {
    const response = await request(new URL(`/api/v1${path}`, origin), {
      method,
      redirect: 'error',
      signal: AbortSignal.timeout(30000),
      headers: { Authorization: `Bearer ${env.COOLIFY_TOKEN}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    // API errors can include environment variables or deployment logs. Never print their bodies.
    if (!response.ok) throw new Error(`Coolify ${method} ${path} returned HTTP ${response.status}`)
    try {
      return await response.json()
    } catch {
      throw new Error(`Coolify ${method} ${path} returned invalid JSON`)
    }
  }
  const latest = await request(
    `https://api.github.com/repos/${env.GITHUB_REPOSITORY}/git/ref/heads/main`,
    {
      redirect: 'error',
      signal: AbortSignal.timeout(30000),
      headers: { Authorization: `Bearer ${env.GH_TOKEN}`, Accept: 'application/vnd.github+json' },
    },
  )
  if (!latest.ok) throw new Error(`Cannot verify main head: HTTP ${latest.status}`)
  if ((await latest.json()).object?.sha !== sha) {
    console.log('Superseded commit: no deployment requested.')
    return { skipped: true }
  }
  const path = `/applications/${env.COOLIFY_APPLICATION_UUID}`
  const app = await api(path)
  const repository = String(app.git_repository || '')
    .replace(/\.git$/, '')
    .replace(/^https:\/\/github.com\//, '')
    .replace(/^git@github.com:/, '')
  if (
    repository.toLowerCase() !== env.GITHUB_REPOSITORY.toLowerCase() ||
    app.git_branch !== 'main' ||
    app.build_pack !== 'dockerfile'
  )
    throw new Error('Coolify source must match this repository, main and Dockerfile')
  if (app.settings?.is_auto_deploy_enabled !== false)
    throw new Error('Disable Coolify automatic push deployments first')
  if (app.settings?.is_build_server_enabled !== true)
    throw new Error('Select the dedicated Coolify build server first')
  if (!app.docker_registry_image_name)
    throw new Error('Configure the private registry image before deployment')
  if (
    !String(app.fqdn || '')
      .split(',')
      .includes(publicURL.origin)
  )
    throw new Error('Public URL does not match the Coolify application domain')
  await api(path, 'PATCH', { git_commit_sha: sha, docker_registry_image_tag: sha })
  const pinned = await api(path)
  if (pinned.git_commit_sha !== sha || pinned.docker_registry_image_tag !== sha)
    throw new Error('Coolify did not retain the verified commit and image tag')
  // CMS content and BuildKit secrets do not invalidate cached builder layers.
  // Coolify cannot selectively disable just that layer, so force this release build.
  const queued = await api('/deploy', 'POST', { uuid: env.COOLIFY_APPLICATION_UUID, force: true })
  const item = queued.deployments?.find(
    (entry) => entry.resource_uuid === env.COOLIFY_APPLICATION_UUID,
  )
  if (!item?.deployment_uuid) throw new Error('Coolify did not return a deployment UUID')
  const release = {
    commit: sha,
    deployment: item.deployment_uuid,
    image: `${app.docker_registry_image_name}:${sha}`,
    digest: null,
    status: 'queued',
    publicURL: publicURL.origin,
  }
  await record(release)
  const deadline = now() + 24 * 60 * 1000
  let previousStatus
  try {
    while (now() < deadline) {
      const state = await api(`/deployments/${encodeURIComponent(item.deployment_uuid)}`)
      release.status = state.status
      if (state.status !== previousStatus) console.log(`Deployment: ${state.status}`)
      previousStatus = state.status
      if (state.status === 'finished') {
        if (state.commit !== sha)
          throw new Error('Deployed revision differs from the tested commit')
        // BuildKit records the pushed manifest (or manifest list) digest in its logs.
        const logs = typeof state.logs === 'string' ? state.logs : JSON.stringify(state.logs || [])
        const manifests = [...logs.matchAll(/exporting manifest(?: list)? (sha256:[a-f0-9]{64})/g)]
        release.digest = manifests.at(-1)?.[1] || null
        const ready = await request(new URL('/api/health/ready', publicURL), {
          redirect: 'error',
          signal: AbortSignal.timeout(15000),
        })
        if (ready.status !== 200) throw new Error('Public readiness check failed')
        const health = await ready.json().catch(() => {
          throw new Error('Public readiness returned invalid JSON')
        })
        if (health.status !== 'ready') throw new Error('Public readiness check failed')
        if (health.revision !== sha)
          throw new Error('Public application serves a different revision')
        const home = await request(publicURL, {
          redirect: 'error',
          signal: AbortSignal.timeout(15000),
        })
        if (home.status !== 200 || !(await home.text()).includes('<html'))
          throw new Error('Public homepage smoke check failed')
        await record(release)
        if (!release.digest)
          console.log(
            'Manifest digest unavailable in API logs; confirm the registry digest during acceptance.',
          )
        console.log(`Verified release ${sha}`)
        return release
      }
      if (!['queued', 'in_progress'].includes(state.status)) {
        await record(release)
        throw new Error(`Deployment did not finish successfully: ${state.status}`)
      }
      await sleep(10000)
    }
    release.status = 'timed_out'
    await record(release)
    throw new Error(
      'Deployment timed out; inspect Coolify before retrying. The server job was not cancelled.',
    )
  } catch (error) {
    if (release.status === 'finished') release.status = 'verification_failed'
    else if (['queued', 'in_progress'].includes(release.status))
      release.status = 'monitoring_failed'
    await record(release)
    throw error
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  deploy(process.env).catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
