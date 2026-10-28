import { describe, expect, it } from 'vitest'
import { filterCacheKeyQuery, usesCacheKeyQuery } from './cacheKeyQuery'

describe('filterCacheKeyQuery', () => {
  it('returns urls without a query untouched', () => {
    expect(filterCacheKeyQuery('/proiecte')).toBe('/proiecte')
  })

  it('drops tracking and unknown parameters', () => {
    expect(filterCacheKeyQuery('/proiecte?utm_source=x&fbclid=abc')).toBe('/proiecte')
    expect(filterCacheKeyQuery('/despre?tag=website')).toBe('/despre')
  })

  it('keeps a valid project tag on the project list, in both locales', () => {
    expect(filterCacheKeyQuery('/proiecte?utm_source=x&tag=web-app')).toBe('/proiecte?tag=web-app')
    expect(filterCacheKeyQuery('/en/work?tag=shopify&fbclid=1')).toBe('/en/work?tag=shopify')
  })

  it('drops tag values that are not a service tag', () => {
    expect(filterCacheKeyQuery('/proiecte?tag=random123')).toBe('/proiecte')
    expect(filterCacheKeyQuery('/proiecte?tag=')).toBe('/proiecte')
    expect(filterCacheKeyQuery(`/proiecte?tag=${'a'.repeat(65)}`)).toBe('/proiecte')
  })

  it('keeps only the first value of a repeated parameter', () => {
    expect(filterCacheKeyQuery('/proiecte?tag=website&tag=shopify')).toBe('/proiecte?tag=website')
    expect(filterCacheKeyQuery('/proiecte?tag=nope&tag=shopify')).toBe('/proiecte')
  })

  it('keeps a known service on the contact pages', () => {
    expect(filterCacheKeyQuery('/contact?serviciu=aplicatie-web&utm_x=1')).toBe('/contact?serviciu=aplicatie-web')
    expect(filterCacheKeyQuery('/en/contact?service=grants')).toBe('/en/contact?service=grants')
    expect(filterCacheKeyQuery('/en/contact?service=wordpress&serviciu=website')).toBe('/en/contact?serviciu=website&service=wordpress')
  })

  it('drops unknown service values', () => {
    expect(filterCacheKeyQuery('/contact?serviciu=random')).toBe('/contact')
    expect(filterCacheKeyQuery('/en/contact?service=__proto__')).toBe('/en/contact')
  })

  it('does not apply one page\'s parameters to another', () => {
    expect(filterCacheKeyQuery('/contact?tag=website')).toBe('/contact')
    expect(filterCacheKeyQuery('/proiecte?serviciu=website')).toBe('/proiecte')
  })

  it('drops hero everywhere', () => {
    expect(filterCacheKeyQuery('/en?hero=1')).toBe('/en')
    expect(filterCacheKeyQuery('/proiecte?hero=1')).toBe('/proiecte')
  })

  it('handles an empty query', () => {
    expect(filterCacheKeyQuery('/proiecte?')).toBe('/proiecte')
  })

  it('strips the whole query from the cached api routes', () => {
    for (const path of ['/api/projects', '/api/projects/nav', '/api/projects/some-slug', '/api/news', '/api/news/x', '/api/home/settings']) {
      expect(filterCacheKeyQuery(`${path}?r=${Math.random()}&tag=website`)).toBe(path)
    }
  })

  it('leaves other api routes alone', () => {
    expect(filterCacheKeyQuery('/api/blog?service=website')).toBe('/api/blog')
  })
})

describe('usesCacheKeyQuery', () => {
  it('applies to GET and HEAD pages with a query', () => {
    expect(usesCacheKeyQuery('GET', '/proiecte?utm_x=1')).toBe(true)
    expect(usesCacheKeyQuery('HEAD', '/en?x=1')).toBe(true)
  })

  it('applies to the cached public api routes', () => {
    for (const path of ['/api/projects?r=1', '/api/projects/nav?r=1', '/api/news?r=1', '/api/news/x?r=1', '/api/home/settings?r=1']) {
      expect(usesCacheKeyQuery('GET', path)).toBe(true)
    }
  })

  it('skips other methods and urls without a query', () => {
    expect(usesCacheKeyQuery('POST', '/proiecte?x=1')).toBe(false)
    expect(usesCacheKeyQuery('GET', '/proiecte')).toBe(false)
    expect(usesCacheKeyQuery('POST', '/api/projects?x=1')).toBe(false)
  })

  it('skips other api routes, assets and admin', () => {
    for (const path of ['/api/blog?x=1', '/api/leads?x=1', '/_nuxt/a.js?v=1', '/_ipx/w_1/a.png?x=1', '/_fonts/a.woff2?x=1', '/admin/projects?x=1', '/admin?x=1']) {
      expect(usesCacheKeyQuery('GET', path)).toBe(false)
    }
  })
})
