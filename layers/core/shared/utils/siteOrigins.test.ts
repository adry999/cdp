import { describe, expect, it } from 'vitest'
import { originForHost, toSiteOrigins } from './siteOrigins'

const origins = { en: 'https://codepedia.studio', ro: 'https://codepedia.md' }

describe('toSiteOrigins', () => {
  it('uses the RO domain when set and trims trailing slashes', () => {
    expect(toSiteOrigins({ siteUrl: 'https://codepedia.studio/', siteUrlRo: 'https://codepedia.md/' })).toEqual(origins)
  })

  it('falls back to a single origin for both locales', () => {
    expect(toSiteOrigins({ siteUrl: 'http://localhost:3000', siteUrlRo: '' })).toEqual({
      en: 'http://localhost:3000',
      ro: 'http://localhost:3000',
    })
  })
})

describe('originForHost', () => {
  it('matches an official domain, with or without www', () => {
    expect(originForHost(origins, 'codepedia.md')).toBe('https://codepedia.md')
    expect(originForHost(origins, 'www.codepedia.studio')).toBe('https://codepedia.studio')
    expect(originForHost(origins, 'CODEPEDIA.MD')).toBe('https://codepedia.md')
  })

  it('returns undefined for any other host', () => {
    expect(originForHost(origins, 'codepedia-git-main.vercel.app')).toBeUndefined()
    expect(originForHost(origins, 'evilcodepedia.md')).toBeUndefined()
    expect(originForHost(origins, undefined)).toBeUndefined()
  })
})
