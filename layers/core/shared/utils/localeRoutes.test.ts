import { describe, expect, it } from 'vitest'
import { crossLocalePageRedirects, redirectRouteRules, withoutTrailingSlash } from './localeRoutes'

describe('crossLocalePageRedirects', () => {
  const rules = crossLocalePageRedirects({
    proiecte: { ro: '/proiecte', en: '/work' },
    'proiecte-slug': { ro: '/proiecte/[slug]', en: '/work/[slug]' },
    contact: { ro: '/contact', en: '/contact' },
  })

  it('sends each locale to the other locale path', () => {
    expect(rules).toContainEqual({ from: '/en/proiecte', to: '/en/work' })
    expect(rules).toContainEqual({ from: '/work', to: '/proiecte' })
  })

  it('redirects the subtree of a slug page', () => {
    expect(rules).toContainEqual({ from: '/en/proiecte/**', to: '/en/work/**' })
    expect(rules).toContainEqual({ from: '/work/**', to: '/proiecte/**' })
  })

  it('skips pages with the same path in both locales', () => {
    expect(rules.some((rule) => rule.from.includes('contact'))).toBe(false)
  })
})

describe('redirectRouteRules', () => {
  it('builds permanent Nitro redirects', () => {
    expect(redirectRouteRules([{ from: '/a', to: '/b' }])).toEqual({ '/a': { redirect: { to: '/b', statusCode: 301 } } })
  })
})

describe('withoutTrailingSlash', () => {
  it('strips the slash from every path but the root', () => {
    expect(withoutTrailingSlash('/proiecte/')).toBe('/proiecte')
    expect(withoutTrailingSlash('/en/work/')).toBe('/en/work')
    expect(withoutTrailingSlash('/')).toBeUndefined()
    expect(withoutTrailingSlash('/proiecte')).toBeUndefined()
  })
})
