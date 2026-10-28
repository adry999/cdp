import { describe, expect, it } from 'vitest'
import { isLocalRedirectTarget } from './redirectTarget'

describe('isLocalRedirectTarget', () => {
  it('accepts site-local paths', () => {
    expect(isLocalRedirectTarget('/proiecte/nou')).toBe(true)
    expect(isLocalRedirectTarget('/en/work/x?a=1')).toBe(true)
  })

  it('refuses protocol-relative and backslash targets', () => {
    expect(isLocalRedirectTarget('//evil.com')).toBe(false)
    expect(isLocalRedirectTarget('/\\evil.com')).toBe(false)
  })

  it('refuses absolute URLs, bare "/" and empty values', () => {
    expect(isLocalRedirectTarget('https://evil.com')).toBe(false)
    expect(isLocalRedirectTarget('javascript:alert(1)')).toBe(false)
    expect(isLocalRedirectTarget('/')).toBe(false)
    expect(isLocalRedirectTarget('')).toBe(false)
  })
})
