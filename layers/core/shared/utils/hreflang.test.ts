import { describe, expect, it } from 'vitest'
import { moveToOrigin, xDefaultHref } from './hreflang'

describe('xDefaultHref', () => {
  it('is the RO URL, whatever the route', () => {
    expect(xDefaultHref('https://codepedia.md/', 'https://codepedia.studio/en')).toBe('https://codepedia.md/')
    expect(xDefaultHref('https://codepedia.md/blog', 'https://codepedia.studio/en/blog')).toBe('https://codepedia.md/blog')
    expect(xDefaultHref('https://codepedia.md/servicii/website', 'x')).toBe('https://codepedia.md/servicii/website')
  })

  it('falls back only when there is no RO alternate', () => {
    expect(xDefaultHref(undefined, 'https://codepedia.md/x')).toBe('https://codepedia.md/x')
  })
})

describe('moveToOrigin', () => {
  it('swaps the base for the locale origin', () => {
    expect(moveToOrigin('https://codepedia.studio/en/blog', 'https://codepedia.studio/', 'https://codepedia.md')).toBe('https://codepedia.md/en/blog')
  })

  it('leaves other bases alone', () => {
    expect(moveToOrigin('https://other.example/x', 'https://codepedia.studio', 'https://codepedia.md')).toBe('https://other.example/x')
  })
})
