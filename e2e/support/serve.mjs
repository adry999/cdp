// Serves one production build twice: :3013 with the qualifier flag on (for
// e2e/qualifier.spec.ts) and :3012 with the defaults. NUXT_PUBLIC_* variables
// override runtime config at boot, so no second build is needed. Playwright
// waits on :3012, which starts only once :3013 answers, so both servers are
// up before the first test.
import { spawn } from 'node:child_process'
import { get } from 'node:http'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'

const SERVER_ENTRY = '.output/server/index.mjs'
const children = []

function start(env) {
  const child = spawn(process.execPath, [SERVER_ENTRY], { env: { ...process.env, ...env }, stdio: 'inherit' })
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
while (!(await responds('http://localhost:3013/favicon.svg'))) await delay(250)
start({ PORT: '3012' })
