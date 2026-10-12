import { describe, expect, it } from 'vitest'
import { SITE_NAV_LINKS, activeNavId, currentServiceSlug, groupServiceLinks } from './siteNav'

describe('activeNavId', () => {
  it.each([
    ['servicii', 'services'],
    ['servicii-slug', 'services'],
    ['proiecte', 'work'],
    ['proiecte-slug', 'work'],
    ['blog', 'blog'],
    ['blog-slug', 'blog'],
    ['blog-categorie-slug', 'blog'],
  ])('marks %s as %s', (baseName, expected) => {
    expect(activeNavId(baseName)).toBe(expected)
  })

  it.each(['index', 'contact', 'preturi', 'despre', 'noutati', 'serviciile', 'blogger'])('marks nothing on %s', (baseName) => {
    expect(activeNavId(baseName)).toBeNull()
  })

  it('marks nothing without a route name', () => {
    expect(activeNavId(undefined)).toBeNull()
  })
})

describe('groupServiceLinks', () => {
  const link = (slug: string) => ({ slug })
  const all = ['website', 'web-app', 'wordpress', 'shopify', 'ai-automation', 'granturi'].map(link)

  it('splits services into sites and apps, in the menu order', () => {
    const groups = groupServiceLinks(all)
    expect(groups.map((g) => g.links.map((l) => l.slug))).toEqual([
      ['website', 'wordpress', 'shopify'],
      ['web-app', 'ai-automation', 'granturi'],
    ])
  })

  it('leaves out services that were filtered away', () => {
    const groups = groupServiceLinks(all.filter((l) => l.slug !== 'granturi'))
    expect(groups[1]?.links.map((l) => l.slug)).toEqual(['web-app', 'ai-automation'])
  })

  it('drops a group that ends up empty', () => {
    expect(groupServiceLinks([link('website')]).map((g) => g.labelKey)).toEqual(['nav.groupSites'])
  })

  it('ignores services outside both groups', () => {
    expect(groupServiceLinks([link('unknown')])).toEqual([])
  })
})

describe('currentServiceSlug', () => {
  const links = [{ slug: 'web-app', routeSlug: { ro: 'aplicatie-web', en: 'web-app' } }]

  it('matches the route slug of the active locale', () => {
    expect(currentServiceSlug(links, 'servicii-slug', 'aplicatie-web', 'ro')).toBe('web-app')
    expect(currentServiceSlug(links, 'servicii-slug', 'web-app', 'en')).toBe('web-app')
  })

  it('does not match another locale\'s slug', () => {
    expect(currentServiceSlug(links, 'servicii-slug', 'aplicatie-web', 'en')).toBeNull()
  })

  it('returns null off a service page', () => {
    expect(currentServiceSlug(links, 'servicii', 'aplicatie-web', 'ro')).toBeNull()
    expect(currentServiceSlug(links, 'servicii-slug', undefined, 'ro')).toBeNull()
  })
})

describe('SITE_NAV_LINKS', () => {
  it('lists projects and blog, once each', () => {
    expect(SITE_NAV_LINKS.map((l) => l.id)).toEqual(['work', 'blog'])
  })
})
