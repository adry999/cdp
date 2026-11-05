// Restores a backup made by `npm run backup` (../backup/<YYYY-MM-DD>/) into the database and media store
// named by the env file, so the site can move to any Supabase (cloud, self-hosted or the local stack):
//   node --env-file=.env.offline scripts/restore.ts [backup dir]    (`npm run local` does this for the local stack)
//   node --env-file=.env.new scripts/restore.ts ../backup/2026-11-04  (a new host)
// Reads SUPABASE_DB_URL, R2_* (R2_ENDPOINT/R2_REGION for other S3 stores) and NUXT_PUBLIC_MEDIA_URL.
// Refuses a database that already has projects: it never overwrites data. Needs Docker (psql runs in a container).
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { createR2Client } from '../layers/core/server/utils/r2.ts'

const PSQL_IMAGE = 'public.ecr.aws/supabase/postgres:17.6.1.167'
// Backups made before media-url.txt existed all served media from here.
const DEFAULT_SOURCE_MEDIA_URL = 'https://media.codepedia.md'
const TYPES: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif',
  gif: 'image/gif', svg: 'image/svg+xml', mp4: 'video/mp4', pdf: 'application/pdf',
}

function need(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name} in the env file`)
  return value
}

const backupRoot = resolve(process.cwd(), '..', 'backup')
const dir = process.argv[2]
  ? resolve(process.argv[2])
  : join(backupRoot, readdirSync(backupRoot).filter((name) => /^\d{4}-\d{2}-\d{2}$/.test(name)).sort().at(-1) ?? '')
if (!existsSync(join(dir, 'db', 'data.sql'))) throw new Error(`No backup at ${dir} (expected db/data.sql)`)

// psql runs in Docker, where the host's own loopback is host.docker.internal.
const dbUrl = need('SUPABASE_DB_URL').replace(/@(127\.0\.0\.1|localhost)(?=[:/])/, '@host.docker.internal')
const mediaUrl = need('NUXT_PUBLIC_MEDIA_URL').replace(/\/+$/, '')
const sourceFile = join(dir, 'media-url.txt')
const sourceMediaUrl = (existsSync(sourceFile) ? readFileSync(sourceFile, 'utf8').trim() : DEFAULT_SOURCE_MEDIA_URL).replace(/\/+$/, '')

function psql(sql: string, extra: string[] = []): string {
  const result = spawnSync('docker', ['run', '--rm', '-i', PSQL_IMAGE, 'psql', dbUrl, '-v', 'ON_ERROR_STOP=1', '-X', '-q', ...extra], {
    input: sql,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  if (result.status !== 0) throw new Error(`psql failed (exit ${result.status}):\n${result.stderr}`)
  return result.stdout
}

const count = (table: string) => Number(psql(`select count(*) from ${table}`, ['-t', '-A']).trim())
// A brand-new database has no tables yet: the schema comes from the dump. The local stack already has it from supabase/migrations.
const hasSchema = psql(`select to_regclass('public.projects') is not null`, ['-t', '-A']).trim() === 't'
if (hasSchema && count('public.projects') > 0) throw new Error('The target database already has projects: restore only into an empty one.')

// Platform-only lines fail outside Supabase cloud; the statement timeouts of anon/authenticated are what matters.
const roles = readFileSync(join(dir, 'db', 'roles.sql'), 'utf8')
  .split('\n')
  .filter((line) => !/supabase_admin|GRANT SET ON PARAMETER/.test(line))
  .join('\n')
psql(roles)
if (!hasSchema) psql(readFileSync(join(dir, 'db', 'schema.sql'), 'utf8'), ['--single-transaction'])

// storage.* belongs to Supabase Storage, which no longer holds the media (they live in the S3 store below).
// An older Auth (the local stack) lacks some newer auth.* tables and columns: only what the target has is loaded,
// and every dropped table or non-empty column is reported.
const columns = new Map<string, Set<string>>()
for (const line of psql(
  `select format('"%s"."%s"', table_schema, table_name), column_name from information_schema.columns`,
  ['-t', '-A', '-F', '\t'],
).trim().split('\n')) {
  const [table, column] = line.split('\t') as [string, string]
  columns.set(table, (columns.get(table) ?? new Set()).add(column))
}
const skipped: string[] = []
const data = readFileSync(join(dir, 'db', 'data.sql'), 'utf8')
  .replace(/^COPY ("[a-z_]+"\."[a-z_]+") \(([^)]*)\) FROM stdin;\n([\s\S]*?)^\\\.$/gm, (block, table: string, list: string, body: string) => {
    if (table.startsWith('"storage".')) return ''
    const rows = body.split('\n').filter(Boolean)
    const target = columns.get(table)
    if (!target) {
      if (rows.length) skipped.push(`${table} (${rows.length} rows)`)
      return ''
    }
    const names = list.split(', ').map((name) => name.replace(/"/g, ''))
    const keep = names.map((name) => target.has(name))
    if (keep.every(Boolean)) return block
    // COPY text format: fields split on real tabs (a tab inside a value is written as \t).
    const cells = rows.map((row) => row.split('\t'))
    names.forEach((name, i) => {
      if (!keep[i] && cells.some((cell) => cell[i] !== '\\N')) skipped.push(`${table}.${name}`)
    })
    const kept = (values: string[]) => values.filter((_, i) => keep[i])
    return `COPY ${table} (${kept(list.split(', ')).join(', ')}) FROM stdin;\n${cells.map((cell) => `${kept(cell).join('\t')}\n`).join('')}\\.`
  })
  .replaceAll(`${sourceMediaUrl}/`, `${mediaUrl}/`)
if (skipped.length) console.warn(`Not in the target database, left out: ${skipped.join(', ')}`)

psql(`SET session_replication_role = replica;\n${data}`, ['--single-transaction'])

const store = createR2Client({
  accountId: process.env.R2_ACCOUNT_ID || '',
  accessKeyId: need('R2_ACCESS_KEY_ID'),
  secretAccessKey: need('R2_SECRET_ACCESS_KEY'),
  bucket: need('R2_BUCKET'),
  endpoint: process.env.R2_ENDPOINT,
  region: process.env.R2_REGION,
})
const mediaDir = join(dir, 'media')
const files = existsSync(mediaDir)
  ? readdirSync(mediaDir, { recursive: true, encoding: 'utf8' }).filter((path) => statSync(join(mediaDir, path)).isFile())
  : []
const existing = new Set(await store.listObjects())
let uploaded = 0
for (const path of files) {
  const key = relative(mediaDir, join(mediaDir, path)).split(sep).join('/')
  if (existing.has(key)) continue
  const type = TYPES[key.split('.').pop()!.toLowerCase()]
  if (!type) throw new Error(`Unknown media type for ${key}`)
  await store.putObject(key, new Uint8Array(readFileSync(join(mediaDir, path))), type)
  uploaded++
}

const projects = count('public.projects')
console.log(`\nRestored ${dir}`)
console.log(`  database: ${projects} projects${hasSchema ? '' : ' (schema from the dump)'}`)
console.log(`  media:    ${uploaded} uploaded, ${files.length - uploaded} already there; URLs ${sourceMediaUrl} -> ${mediaUrl}`)
