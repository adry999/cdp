import { describe, expect, it } from 'vitest'
import { moveToOrigin, xDefaultHref } from './hreflang'

describe('xDefaultHref', () => {
  const ro = 'https://codepedia.md/blog'
  const en = 'https://codepedia.studio/en/blog'

  it('is the EN URL, whatever the route', () => {
    expect(xDefaultHref({ ro, en }, 'x')).toBe(en)
  })

  it('falls back to the RO URL while the EN copy is pending', () => {
    expect(xDefaultHref({ ro, en, enPending: true }, 'x')).toBe(ro)
  })

  it('falls back to RO, then to the given href, when an alternate is missing', () => {
    expect(xDefaultHref({ ro }, 'x')).toBe(ro)
    expect(xDefaultHref({}, 'https://codepedia.md/x')).toBe('https://codepedia.md/x')
    expect(xDefaultHref({ enPending: true }, 'https://codepedia.md/x')).toBe('https://codepedia.md/x')
  })
})

describe('moveToOrigin', () => {
  it('swaps the base for the locale origin', () => {
    expect(moveToOrigin('https://codepedia.studio/en/blog', 'https://codepedia.studio/', 'https://codepedia.md')).toBe('https://codepedia.md/en/blog')
  })

  it('gives the site root its trailing slash', () => {
    expect(moveToOrigin('https://codepedia.studio', 'https://codepedia.studio', 'https://codepedia.md')).toBe('https://codepedia.md/')
    expect(moveToOrigin('https://codepedia.studio/', 'https://codepedia.studio', 'https://codepedia.md')).toBe('https://codepedia.md/')
  })

  it('leaves other bases alone', () => {
    expect(moveToOrigin('https://other.example/x', 'https://codepedia.studio', 'https://codepedia.md')).toBe('https://other.example/x')
  })
})
