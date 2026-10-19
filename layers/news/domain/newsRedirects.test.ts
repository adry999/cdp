import { describe, expect, it } from 'vitest'
import { newsRedirectTargets } from './newsRedirects'

describe('newsRedirectTargets', () => {
  it('builds the RO and EN paths', () => {
    expect(newsRedirectTargets({ slug_ro: 'lansare', slug_en: 'launch' })).toEqual(['/noutati/lansare', '/en/news/launch'])
  })

  it('falls back to the RO slug when there is no EN slug', () => {
    expect(newsRedirectTargets({ slug_ro: 'lansare', slug_en: null })).toEqual(['/noutati/lansare', '/en/news/lansare'])
  })
})
