import { describe, expect, it } from 'vitest'
import { filterCacheKeyQuery, usesCacheKeyQuery } from './cacheKeyQuery'

describe('filterCacheKeyQuery', () => {
  it('returns urls without a query untouched', () => {
    expect(filterCacheKeyQuery('/proiecte')).toBe('/proiecte')
  })

  it('drops tracking and unknown parameters', () => {
    expect(filterCacheKeyQuery('/proiecte?utm_source=x&fbclid=abc')).toBe('/proiecte')
  })

  it('keeps allowlisted parameters and drops the rest', () => {
    expect(filterCacheKeyQuery('/proiecte?utm_source=x&tag=web')).toBe('/proiecte?tag=web')
  })

  it('orders parameters by the allowlist so equivalent urls share one key', () => {
    expect(filterCacheKeyQuery('/x?service=a&serviciu=b')).toBe('/x?serviciu=b&service=a')
    expect(filterCacheKeyQuery('/x?hero=1&tag=a')).toBe('/x?tag=a&hero=1')
  })

  it('drops allowlisted values longer than 64 characters', () => {
    expect(filterCacheKeyQuery(`/proiecte?tag=${'a'.repeat(65)}`)).toBe('/proiecte')
    expect(filterCacheKeyQuery(`/proiecte?tag=${'a'.repeat(64)}`)).toBe(`/proiecte?tag=${'a'.repeat(64)}`)
  })

  it('handles an empty query', () => {
    expect(filterCacheKeyQuery('/proiecte?')).toBe('/proiecte')
  })
})

describe('usesCacheKeyQuery', () => {
  it('applies to GET and HEAD pages with a query', () => {
    expect(usesCacheKeyQuery('GET', '/proiecte?utm_x=1')).toBe(true)
    expect(usesCacheKeyQuery('HEAD', '/en?x=1')).toBe(true)
  })

  it('skips other methods and urls without a query', () => {
    expect(usesCacheKeyQuery('POST', '/proiecte?x=1')).toBe(false)
    expect(usesCacheKeyQuery('GET', '/proiecte')).toBe(false)
  })

  it('skips api, assets and admin', () => {
    for (const path of ['/api/projects?x=1', '/_nuxt/a.js?v=1', '/_ipx/w_1/a.png?x=1', '/_fonts/a.woff2?x=1', '/admin/projects?x=1', '/admin?x=1']) {
      expect(usesCacheKeyQuery('GET', path)).toBe(false)
    }
  })
})
