// The whole site on this machine, from the latest backup: no Supabase cloud, R2 or Hostinger needed.
//   npm run local [-- <backup dir>]   starts the local Supabase stack (Docker, supabase/config.toml), writes
//                                     .env.offline and, while the stack is empty, restores the backup into it
//   npm run dev:local                 the site on http://localhost:3000, admin included (same accounts and MFA)
// `supabase stop` keeps the data in Docker volumes; `supabase stop --no-backup` drops it (the next run restores again).
import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const BUCKET = 'codepedia-media'
const windows = process.platform === 'win32'

// On Windows `supabase` is an npm .cmd shim, so it needs the shell, which splits unquoted args on spaces.
function supabase(args: string[], capture = false): string {
  const result = spawnSync('supabase', windows ? args.map((arg) => `"${arg}"`) : args, {
    shell: windows,
    encoding: 'utf8',
    stdio: capture ? ['inherit', 'pipe', 'inherit'] : 'inherit',
  })
  if (result.status !== 0) throw new Error(`supabase ${args.join(' ')} failed (exit ${result.status}). Is Docker running?`)
  return result.stdout ?? ''
}

supabase(['start'])
const status = Object.fromEntries(
  [...supabase(['status', '-o', 'env'], true).matchAll(/^([A-Z0-9_]+)="?(.*?)"?$/gm)].map((match) => [match[1]!, match[2]!]),
)
const need = (name: string) => {
  if (!status[name]) throw new Error(`supabase status has no ${name}`)
  return status[name]
}

const env = {
  NUXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  NUXT_PUBLIC_SUPABASE_URL: need('API_URL'),
  NUXT_PUBLIC_SUPABASE_ANON_KEY: need('ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: need('SERVICE_ROLE_KEY'),
  SUPABASE_DB_URL: need('DB_URL'),
  NUXT_PUBLIC_MEDIA_URL: `${need('API_URL')}/storage/v1/object/public/${BUCKET}`,
  R2_ENDPOINT: need('STORAGE_S3_URL'),
  R2_REGION: need('S3_PROTOCOL_REGION'),
  R2_ACCESS_KEY_ID: need('S3_PROTOCOL_ACCESS_KEY_ID'),
  R2_SECRET_ACCESS_KEY: need('S3_PROTOCOL_ACCESS_KEY_SECRET'),
  R2_BUCKET: BUCKET,
}
writeFileSync(
  '.env.offline',
  `# Written by npm run local (scripts/local.ts) from \`supabase status\`: the local stack, never production.\n${Object.entries(env)
    .map(([name, value]) => `${name}=${value}`)
    .join('\n')}\n`,
)

function sql(statement: string): string {
  const result = spawnSync('docker', ['exec', 'supabase_db_codepedia', 'psql', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1', '-tAc', statement], {
    encoding: 'utf8',
  })
  if (result.status !== 0) throw new Error(`psql failed: ${result.stderr}`)
  return result.stdout.trim()
}

// The migrations seed the case-study content, so a fresh stack is not empty, but it has no accounts: those only
// come from a backup. Until then, the seeded rows give way to the backup.
const users = sql('select count(*) from auth.users')
if (users === '0') {
  sql(`do $$ declare t record; begin
    for t in select tablename from pg_tables where schemaname = 'public' loop
      execute format('truncate table public.%I restart identity cascade', t.tablename);
    end loop; end $$`)
  const restore = spawnSync(process.execPath, ['--env-file=.env.offline', 'scripts/restore.ts', ...process.argv.slice(2)], { stdio: 'inherit' })
  if (restore.status !== 0) process.exit(restore.status ?? 1)
} else {
  console.log(`\nThe local stack is already restored (${users} accounts): nothing changed (\`supabase stop --no-backup\` to start over).`)
}
console.log('\nReady: npm run dev:local -> http://localhost:3000. When done: supabase stop (frees the RAM).')
