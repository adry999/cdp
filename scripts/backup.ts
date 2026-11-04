// Backs up the database (Supabase CLI dump) and every R2 object into ../backup/<YYYY-MM-DD>/,
// OUTSIDE the repository: data.sql holds personal data from `leads`. Run: npm run backup
// (node --env-file=.env scripts/backup.ts, Node 24 type stripping: relative imports only).
// Needs the Supabase CLI, logged in and linked access to the project (`supabase login`).
import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { createR2Client } from '../layers/core/server/utils/r2.ts'

function need(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name} in .env`)
  return value
}

const projectRef = new URL(need('NUXT_PUBLIC_SUPABASE_URL')).hostname.split('.')[0]!
const r2 = createR2Client({
  accountId: need('R2_ACCOUNT_ID'),
  accessKeyId: need('R2_ACCESS_KEY_ID'),
  secretAccessKey: need('R2_SECRET_ACCESS_KEY'),
  bucket: need('R2_BUCKET'),
})

const target = resolve(process.cwd(), '..', 'backup', new Date().toISOString().slice(0, 10))
const dbDir = join(target, 'db')
const mediaDir = join(target, 'media')
mkdirSync(dbDir, { recursive: true })

const dumps: [string, string[]][] = [
  ['roles.sql', ['--role-only']],
  ['schema.sql', []],
  ['data.sql', ['--data-only', '--use-copy']],
]
for (const [file, flags] of dumps) {
  const out = join(dbDir, file)
  const result = spawnSync('supabase', ['db', 'dump', '--project-ref', projectRef, ...flags, '-f', out], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  if (result.status !== 0) throw new Error(`supabase db dump failed for ${file} (exit ${result.status})`)
}

const keys = await r2.listObjects()
for (const key of keys) {
  const path = join(mediaDir, ...key.split('/'))
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, await r2.getObject(key))
}

console.log(`\nBackup written to ${target}`)
console.log(`  database: ${dbDir} (roles.sql, schema.sql, data.sql)`)
console.log(`  media:    ${mediaDir} (${keys.length} files)`)
console.log('It holds personal data from `leads`: never commit or share it.')
