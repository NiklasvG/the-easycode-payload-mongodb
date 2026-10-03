import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { setTimeout } from 'node:timers/promises'

const root = fileURLToPath(new URL('../', import.meta.url))
const action = process.argv[2] ?? 'start'
const compose = ['compose', '--project-name', 'easycode-local', '-f', 'compose.local.yml']

function docker(args, { capture = false, allowFailure = false } = {}) {
  const result = spawnSync('docker', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
    timeout: 600_000,
  })
  if (result.error) throw result.error
  if (!allowFailure && result.status !== 0) {
    throw new Error(
      capture
        ? result.stderr.trim() || 'Docker-Aufruf fehlgeschlagen.'
        : 'Docker-Aufruf fehlgeschlagen.',
    )
  }
  return result
}

try {
  if (!['start', 'stop', 'status'].includes(action))
    throw new Error('Erlaubte Aktionen: start, stop, status')
  // Reject remote Docker endpoints before creating or changing any containers.
  const endpoint =
    process.env.DOCKER_HOST ||
    docker(['context', 'inspect', '--format', '{{.Endpoints.docker.Host}}'], {
      capture: true,
    }).stdout.trim()
  if (!endpoint.startsWith('npipe:////./pipe/') && !endpoint.startsWith('unix:///')) {
    throw new Error(
      'Bitte einen lokalen Docker-Desktop-Kontext verwenden; Remote-Endpunkte sind nicht erlaubt.',
    )
  }
  if (action !== 'start') {
    docker([...compose, action === 'stop' ? 'stop' : 'ps'])
  } else {
    docker([...compose, 'up', '-d'])
    const init = `try { rs.status() } catch (error) {
      if (error.code !== 94) throw error;
      rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]});
    }
    quit(db.hello().isWritablePrimary ? 0 : 1);`
    let ready = false
    for (let attempt = 0; attempt < 60; attempt++) {
      const result = docker(
        [...compose, 'exec', '-T', 'mongo', 'mongosh', '--quiet', '--eval', init],
        { capture: true, allowFailure: true },
      )
      if (result.status === 0) {
        ready = true
        break
      }
      await setTimeout(1000)
    }
    if (!ready)
      throw new Error(
        'MongoDB wurde nicht bereit. Bitte docker compose -f compose.local.yml logs mongo prüfen.',
      )
    console.log('Lokale MongoDB bereit: 127.0.0.1:27018 (Replica Set rs0).')
    console.log('Die lokale .env wurde nicht verändert; der Snapshot-Import folgt separat.')
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
