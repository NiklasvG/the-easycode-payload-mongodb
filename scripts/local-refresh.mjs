import { spawnSync } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
try {
  const incoming = path.join(root, 'backups', 'incoming')
  mkdirSync(incoming, { recursive: true })
  const files = readdirSync(incoming)
  const database = files.filter(
    (file) => /^mongo-dump-.*\.tar\.gz$/.test(file) || file === 'database.archive.gz',
  )
  const media = files.filter((file) => /^volume-.*\.tar\.gz$/.test(file) || file === 'media.tar.gz')
  if (database.length !== 1 || media.length !== 1) {
    throw new Error(
      'Bitte genau ein MongoDB-Backup und ein Medienbackup in backups/incoming ablegen. Frühere Archive vorher aus diesem Ordner verschieben.',
    )
  }
  const id = `${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}_${randomBytes(3).toString('hex')}`
  const folder = path.join(root, 'backups', 'live', id)
  mkdirSync(folder, { recursive: true })
  const checksums = {}
  for (const [source, target, key] of [
    [database[0], 'database.archive.gz', 'databaseSha256'],
    [media[0], 'media.tar.gz', 'mediaSha256'],
  ]) {
    const destination = path.join(folder, target)
    copyFileSync(path.join(incoming, source), destination)
    checksums[key] = createHash('sha256').update(readFileSync(destination)).digest('hex')
  }
  writeFileSync(
    path.join(folder, 'manifest.json'),
    `${JSON.stringify(
      {
        sourceDatabase: 'easycode_import',
        sourceDatabaseConfirmed: true,
        mongoMajorVersion: '8.0',
        sourceFilename: database[0],
        mediaSourceFilename: media[0],
        preparedAt: new Date().toISOString(),
        ...checksums,
        status: 'ready-for-import',
      },
      null,
      2,
    )}\n`,
  )
  // The confirmed production database is easycode_import; source credentials are never read.
  const result = spawnSync(
    process.execPath,
    [path.join(root, 'scripts/local-import.mjs'), '--from', folder],
    {
      cwd: root,
      stdio: 'inherit',
    },
  )
  if (result.error) throw result.error
  process.exitCode = result.status ?? 1
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
