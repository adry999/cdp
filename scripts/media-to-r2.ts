// Copies every file of the Supabase Storage bucket `project-media` to the R2 bucket under the SAME key.
// Idempotent: keys already in R2 are skipped. Run: npm run media:to-r2
// (node --env-file=.env scripts/media-to-r2.ts, Node 24 type stripping: relative imports only).
import { createR2Client } from '../layers/core/server/utils/r2.ts'

const BUCKET = 'project-media'

function need(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name} in .env`)
  return value
}

const supabaseUrl = need('NUXT_PUBLIC_SUPABASE_URL').replace(/\/+$/, '')
const serviceKey = need('SUPABASE_SERVICE_ROLE_KEY')
const mediaUrl = need('NUXT_PUBLIC_MEDIA_URL').replace(/\/+$/, '')
const r2 = createR2Client({
  accountId: need('R2_ACCOUNT_ID'),
  accessKeyId: need('R2_ACCESS_KEY_ID'),
  secretAccessKey: need('R2_SECRET_ACCESS_KEY'),
  bucket: need('R2_BUCKET'),
})

const auth = { authorization: `Bearer ${serviceKey}`, apikey: serviceKey }

interface Entry {
  name: string
  id: string | null
}

// Folders come back with `id: null`; files have an id.
async function listKeys(prefix = ''): Promise<string[]> {
  const keys: string[] = []
  for (let offset = 0; ; offset += 100) {
    const response = await fetch(`${supabaseUrl}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: { ...auth, 'content-type': 'application/json' },
      body: JSON.stringify({ prefix, limit: 100, offset, sortBy: { column: 'name', order: 'asc' } }),
    })
    if (!response.ok) throw new Error(`Supabase list "${prefix}" failed: ${response.status} ${await response.text()}`)
    const entries = (await response.json()) as Entry[]
    for (const entry of entries) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.id === null) keys.push(...(await listKeys(path)))
      else keys.push(path)
    }
    if (entries.length < 100) return keys
  }
}

const encodePath = (key: string) => key.split('/').map(encodeURIComponent).join('/')

const supabaseKeys = await listKeys()
const existing = new Set(await r2.listObjects())
let copied = 0
let skipped = 0
const failed: string[] = []

for (const key of supabaseKeys) {
  if (existing.has(key)) {
    skipped++
    continue
  }
  try {
    const response = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${encodePath(key)}`, { headers: auth })
    if (!response.ok) throw new Error(`download answered ${response.status}`)
    const contentType = response.headers.get('content-type') ?? 'application/octet-stream'
    await r2.putObject(key, new Uint8Array(await response.arrayBuffer()), contentType)
    copied++
    console.log('copied', key)
  } catch (error) {
    failed.push(key)
    console.error('FAILED', key, error)
  }
}

console.log(`\nSupabase: ${supabaseKeys.length} files. R2: ${copied} copied, ${skipped} already there, ${failed.length} failed.`)
if (failed.length) process.exitCode = 1

// Every column that stores a full public image URL. Run it in the Supabase SQL editor only after
// the summary above shows no failures; it is idempotent, and re-running it changes nothing.
const from = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/`
const to = `${mediaUrl}/`
const columns = [
  ['projects', 'cover_path'],
  ['projects', 'hero_path'],
  ['project_images', 'path'],
  ['site_settings', 'og_image_path'],
] as const
console.log('\n-- SQL to repoint the database at R2 (not run by this script):')
for (const [table, column] of columns) {
  console.log(`update ${table} set ${column} = replace(${column}, '${from}', '${to}') where ${column} like '${from}%';`)
}
