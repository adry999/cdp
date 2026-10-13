import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { buildCsp, inlineScriptHashes } from './csp'

const sha = (body: string) => `'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`

describe('inlineScriptHashes', () => {
  it('hashes the inline scripts the browser runs, once each', () => {
    const html = [
      '<script type="importmap">{"imports":{"#entry":"/_nuxt/a.js"}}</script>',
      '<script>try{document.documentElement.dataset.theme="dark"}catch(e){}</script>',
      '<script type="module">import "/x.js"</script>',
      '<script>try{document.documentElement.dataset.theme="dark"}catch(e){}</script>',
    ].join('\n')
    expect(inlineScriptHashes(html)).toEqual([
      sha('{"imports":{"#entry":"/_nuxt/a.js"}}'),
      sha('try{document.documentElement.dataset.theme="dark"}catch(e){}'),
      sha('import "/x.js"'),
    ])
  })

  it('skips external scripts, data blocks and empty scripts', () => {
    const html = [
      '<script src="/_nuxt/entry.js" type="module"></script>',
      '<script type="application/ld+json">{"@context":"https://schema.org"}</script>',
      '<script type="application/json" data-nuxt-data="nuxt-app">[1]</script>',
      '<script></script>',
    ].join('\n')
    expect(inlineScriptHashes(html)).toEqual([])
  })

  it('hashes multi-byte content as UTF-8', () => {
    const body = 'console.log("ă")'
    expect(inlineScriptHashes(`<script>${body}</script>`)).toEqual([sha(body)])
  })
})

describe('buildCsp', () => {
  it('lists the script hashes and the Supabase host, with no unsafe-inline on scripts', () => {
    const csp = buildCsp({ supabaseHost: 'x.supabase.co', scriptSources: ["'sha256-abc'", "'sha256-def'"] })
    expect(csp).toContain(`script-src 'self' 'sha256-abc' 'sha256-def' https://*.googletagmanager.com https://connect.facebook.net;`)
    expect(csp).toContain(`img-src 'self' data: https://x.supabase.co `)
    expect(csp).toContain(` https://x.supabase.co; frame-ancestors 'none';`)
    expect(csp).not.toMatch(/script-src [^;]*'unsafe-inline'/)
    expect(csp).toContain(`style-src 'self' 'unsafe-inline'`)
  })

  it('drops frame-ancestors for the meta tag and the Supabase host when unknown', () => {
    const csp = buildCsp({ scriptSources: [], meta: true })
    expect(csp).toContain(`script-src 'self' https://*.googletagmanager.com`)
    expect(csp).not.toContain('frame-ancestors')
    expect(csp).toContain(`img-src 'self' data: https://*.google-analytics.com`)
  })
})
