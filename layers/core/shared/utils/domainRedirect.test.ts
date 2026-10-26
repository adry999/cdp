import { describe, expect, it } from 'vitest'
import { domainRedirectTarget } from './domainRedirect'

const origins = { en: 'https://codepedia.studio', ro: 'https://codepedia.md' }
const go = (host: string | null, pathname: string, search = '', o = origins) =>
  domainRedirectTarget({ origins: o, host, pathname, search })

describe('domainRedirectTarget', () => {
  it('sends a Romanian path on the EN domain to the RO domain, keeping the query', () => {
    expect(go('codepedia.studio', '/proiecte/startica-app')).toBe('https://codepedia.md/proiecte/startica-app')
    expect(go('codepedia.studio', '/contact', '?serviciu=wordpress')).toBe('https://codepedia.md/contact?serviciu=wordpress')
  })

  it('sends an English path on the RO domain to the EN domain', () => {
    expect(go('codepedia.md', '/en/work/bloom')).toBe('https://codepedia.studio/en/work/bloom')
  })

  it('leaves a page on its own domain alone', () => {
    expect(go('codepedia.md', '/proiecte')).toBeNull()
    expect(go('codepedia.studio', '/en/services')).toBeNull()
  })

  it('moves www to the official domain of the page language', () => {
    expect(go('www.codepedia.studio', '/en/work/bloom')).toBe('https://codepedia.studio/en/work/bloom')
    expect(go('www.codepedia.studio', '/despre')).toBe('https://codepedia.md/despre')
    expect(go('www.codepedia.md', '/despre')).toBe('https://codepedia.md/despre')
  })

  it('drops a trailing slash in the same hop', () => {
    expect(go('codepedia.studio', '/proiecte/')).toBe('https://codepedia.md/proiecte')
  })

  it('does not touch the home pages, assets, the API, the admin or crawler files', () => {
    for (const path of ['/', '/en', '/api/health', '/admin/projects', '/_nuxt/a.js', '/_ipx/w_1200/x.png', '/sitemap.xml', '/robots.txt', '/llms.txt', '/brand/logo.svg']) {
      expect(go('codepedia.studio', path)).toBeNull()
      expect(go('codepedia.md', path)).toBeNull()
    }
  })

  it('ignores unknown hosts and a single-domain setup', () => {
    expect(go('localhost:3000', '/proiecte')).toBeNull()
    expect(go('cdp-git-dev.vercel.app', '/en/work')).toBeNull()
    expect(go(null, '/proiecte')).toBeNull()
    const single = { en: 'http://localhost:3000', ro: 'http://localhost:3000' }
    expect(go('localhost:3000', '/en/work', '', single)).toBeNull()
  })

  it('matches the host case-insensitively', () => {
    expect(go('CodePedia.MD', '/proiecte')).toBeNull()
  })
})
