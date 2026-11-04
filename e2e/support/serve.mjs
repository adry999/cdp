// Serves one production build three times: :3013 with the qualifier flag on (for
// e2e/qualifier.spec.ts), :3014 with the origin guard secret set (for
// e2e/origin-guard.spec.ts) and :3012 with the defaults. NUXT_PUBLIC_* variables
// override runtime config at boot, so no second build is needed. Playwright
// waits on :3012, which starts only once :3013 answers, so both servers are
// up before the first test. Each server runs in its own working directory: the swr cache lives on
// disk under ./.data/cache, and a shared one would hand one server's pages (qualifier on) to another.
import { spawn } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { get } from 'node:http'
import { resolve } from 'node:path'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'

const SERVER_ENTRY = resolve('.output/server/index.mjs')
const children = []

function start(env) {
  const cwd = resolve('.data', `e2e-${env.PORT}`)
  rmSync(cwd, { recursive: true, force: true })
  mkdirSync(cwd, { recursive: true })
  const child = spawn(process.execPath, [SERVER_ENTRY], { cwd, env: { ...process.env, ...env }, stdio: 'inherit' })
  child.on('exit', (code) => {
    for (const other of children) other.kill()
    process.exit(code ?? 1)
  })
  children.push(child)
}

function responds(url) {
  return new Promise((resolve) => {
    get(url, (response) => {
      response.resume()
      resolve(true)
    }).on('error', () => resolve(false))
  })
}

start({ PORT: '3013', NUXT_PUBLIC_QUALIFIER_ENABLED: 'true' })
// The guard answers 403 to every request without the header, favicon included; any response counts.
start({ PORT: '3014', NUXT_ORIGIN_SECRET: 'e2e-origin-secret' })
while (!(await responds('http://localhost:3013/favicon.svg'))) await delay(250)
while (!(await responds('http://localhost:3014/favicon.svg'))) await delay(250)
start({ PORT: '3012' })
