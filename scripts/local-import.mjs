import { spawnSync } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const args = process.argv.slice(2)
const container = 'easycode-mongo-local'
let previousEnv
let activated = false
let envTemp

function run(command, commandArgs, capture = true) {
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
    timeout: 600_000,
    maxBuffer: 32 * 1024 * 1024,
  })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(result.stderr?.trim() || `${command} fehlgeschlagen.`)
  return result.stdout?.trim() ?? ''
}
const docker = (args) => run('docker', args)
const hash = (file) => createHash('sha256').update(readFileSync(file)).digest('hex')
function within(parent, child) {
  const relative = path.relative(parent, child)
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)
}
function safeEntry(name) {
  return (
    name &&
    !name.includes('\\') &&
    !name.startsWith('/') &&
    !name.includes(':') &&
    !name.split('/').includes('..') &&
    !/[\r\n]/.test(name)
  )
}

try {
  if (args.length !== 2 || args[0] !== '--from') {
    throw new Error('Verwendung: pnpm local:import --from ./backups/live/<Snapshot>')
  }
  const folder = realpathSync(path.resolve(root, args[1]))
  if (
    !within(realpathSync(root), folder) ||
    !within(path.join(realpathSync(root), 'backups'), folder)
  ) {
    throw new Error('Der Snapshot muss im backups-Verzeichnis dieses Projekts liegen.')
  }
  const manifestPath = path.join(folder, 'manifest.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const source = manifest.sourceDatabase
  if (
    !manifest.sourceDatabaseConfirmed ||
    !/^[a-zA-Z0-9_-]+$/.test(source) ||
    ['admin', 'config', 'local'].includes(source) ||
    manifest.mongoMajorVersion !== '8.0'
  ) {
    throw new Error(
      'Manifest benötigt eine bestätigte Anwendungsdatenbank und MongoDB-Version 8.0.',
    )
  }
  const archive = path.join(folder, 'database.archive.gz')
  const mediaArchive = path.join(folder, 'media.tar.gz')
  if (hash(archive) !== manifest.databaseSha256 || hash(mediaArchive) !== manifest.mediaSha256) {
    throw new Error('Prüfsumme stimmt nicht mit dem Manifest überein.')
  }
  // Reject links and special entries before tar can write into the new directory.
  const entries = run('tar', ['-tzf', mediaArchive]).split(/\r?\n/)
  const verbose = run('tar', ['-tvzf', mediaArchive]).split(/\r?\n/)
  if (!entries.every(safeEntry) || !verbose.every((line) => ['-', 'd'].includes(line[0]))) {
    throw new Error('Medienarchiv enthält unsichere Pfade, Links oder spezielle Dateien.')
  }
  for (const filename of [
    '.env.local',
    '.env.development',
    '.env.development.local',
    '.env.production',
    '.env.production.local',
  ]) {
    if (existsSync(path.join(root, filename)))
      throw new Error(
        `${filename} kann .env übersteuern. Bitte zunächst die lokale Konfiguration bereinigen.`,
      )
  }
  for (const key of [
    'MONGODB_URI',
    'PAYLOAD_UPLOAD_DIR',
    'NEXT_PUBLIC_SERVER_URL',
    'EMAIL_TRANSPORT',
  ]) {
    if (process.env[key])
      throw new Error(`${key} ist in der Shell gesetzt und würde .env übersteuern.`)
  }
  previousEnv = readFileSync(path.join(root, '.env'), 'utf8')
  run(process.execPath, [path.join(root, 'scripts/local-db.mjs'), 'start'], false)
  const inspection = JSON.parse(docker(['inspect', container]))[0]
  const ports = inspection.NetworkSettings.Ports['27017/tcp']
  if (
    inspection.Config.Image !== 'mongo:8.0' ||
    inspection.Config.Labels['com.docker.compose.project'] !== 'easycode-local' ||
    !ports?.length ||
    !ports.every((p) => p.HostIp === '127.0.0.1' && p.HostPort === '27018')
  ) {
    throw new Error('Docker-Ziel entspricht nicht der isolierten lokalen Konfiguration.')
  }
  const id = `${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}_${randomBytes(3).toString('hex')}`
  const database = `easycode_dev_${id}`
  const uploadRelative = `media/snapshots/${id}`
  const uploads = path.join(root, uploadRelative)
  const mediaParent = path.join(root, 'media', 'snapshots')
  mkdirSync(mediaParent, { recursive: true })
  if (!within(realpathSync(root), realpathSync(mediaParent)))
    throw new Error('Medienpfad liegt außerhalb des Projekts.')
  mkdirSync(uploads)
  run('tar', ['-xzf', mediaArchive, '-C', uploads])
  const containerArchive = `/tmp/easycode-${id}.archive.gz`
  docker(['cp', archive, `${container}:${containerArchive}`])
  try {
    docker([
      'exec',
      container,
      'mongorestore',
      '--uri=mongodb://127.0.0.1:27017/?directConnection=true',
      '--gzip',
      `--archive=${containerArchive}`,
      `--nsInclude=${source}.*`,
      `--nsFrom=${source}.*`,
      `--nsTo=${database}.*`,
      '--stopOnError',
      '--quiet',
    ])
  } finally {
    docker(['exec', container, 'rm', '--', containerArchive])
  }
  const query = `const s=db.getSiblingDB(${JSON.stringify(database)});
    const names=s.getCollectionNames();
    print(JSON.stringify({collections:names.length,
      documents:names.reduce((n,c)=>n+s.getCollection(c).countDocuments({}),0),
      media:s.getCollection('media').find({},{filename:1,sizes:1}).toArray()}));`
  const result = JSON.parse(docker(['exec', container, 'mongosh', '--quiet', '--eval', query]))
  if (!result.collections || !result.documents) throw new Error('Keine Anwendungsdaten importiert.')
  const required = new Set()
  for (const media of result.media) {
    if (!media.filename) throw new Error('Medieneintrag ohne Dateinamen.')
    required.add(media.filename)
    for (const size of Object.values(media.sizes ?? {}))
      if (size?.filename) required.add(size.filename)
  }
  const missing = []
  for (const filename of required) {
    const file = path.resolve(uploads, filename)
    if (!safeEntry(filename) || !within(uploads, file))
      throw new Error('Ungültiger Dateiname in der Datenbank.')
    if (!existsSync(file) || !statSync(file).isFile()) missing.push(filename)
  }
  if (missing.length)
    throw new Error(
      `${missing.length} referenzierte Dateien fehlen. .env bleibt unverändert. Erste Dateien: ${missing.slice(0, 5).join(', ')}`,
    )
  const values = {
    MONGODB_URI: `mongodb://127.0.0.1:27018/${database}?replicaSet=rs0&directConnection=true`,
    PAYLOAD_UPLOAD_DIR: `./${uploadRelative}`,
    NEXT_PUBLIC_SERVER_URL: 'http://localhost:3000',
    APP_ENV: 'staging',
    EMAIL_TRANSPORT: 'json',
    UMAMI_SCRIPT_URL: '',
    UMAMI_WEBSITE_ID: '',
  }
  // Keep the local secret and unrelated settings. Replace duplicate assignments as well.
  let updated = previousEnv
  for (const [key, value] of Object.entries(values)) {
    const pattern = new RegExp(`^(?:export\\s+)?${key}\\s*=.*$`, 'gm')
    updated = pattern.test(updated)
      ? updated.replace(pattern, `${key}=${value}`)
      : `${updated.trimEnd()}\n${key}=${value}\n`
  }
  const rollback = path.join(folder, `.env.previous-${id}`)
  writeFileSync(rollback, previousEnv, { flag: 'wx', mode: 0o600 })
  envTemp = path.join(root, `.env.import-${id}`)
  writeFileSync(envTemp, updated, { flag: 'wx', mode: 0o600 })
  renameSync(envTemp, path.join(root, '.env'))
  activated = true
  manifest.status = 'active'
  manifest.localDatabase = database
  manifest.localUploadDir = `./${uploadRelative}`
  manifest.importedAt = new Date().toISOString()
  manifest.validation = {
    collections: result.collections,
    documents: result.documents,
    media: result.media.length,
    files: required.size,
  }
  manifest.rollbackEnv = path.basename(rollback)
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(
    `Import erfolgreich: ${result.documents} Datensätze, ${result.media.length} Medien, ${required.size} referenzierte Dateien geprüft.`,
  )
  console.log(`Lokale Datenbank: ${database}`)
  console.log(`Medien: ${uploadRelative}`)
  console.log(
    'Lokale .env umgestellt. E-Mail-Versand und Analytics sind lokal deaktiviert. Dev-Server bei Bedarf neu starten: pnpm dev',
  )
} catch (error) {
  if (activated) writeFileSync(path.join(root, '.env'), previousEnv, { mode: 0o600 })
  console.error(error.message)
  process.exitCode = 1
}
