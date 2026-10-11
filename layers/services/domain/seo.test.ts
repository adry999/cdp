import { describe, expect, it } from 'vitest'
import { serviceJsonLd } from './seo'

describe('serviceJsonLd', () => {
  const { service, breadcrumbs } = serviceJsonLd({
    name: 'Website',
    description: 'Intro',
    url: 'https://codepedia.md/servicii/website',
    primaryOrigin: 'https://codepedia.studio',
    crumbs: [
      { name: 'CODEPEDIA', url: 'https://codepedia.md/' },
      { name: 'Website', url: 'https://codepedia.md/servicii/website' },
    ],
  })

  it('describes the service with the organization as provider', () => {
    expect(service).toMatchObject({
      '@type': 'Service',
      name: 'Website',
      provider: { '@type': 'Organization', url: 'https://codepedia.studio' },
      areaServed: { '@type': 'Country', name: 'Moldova' },
    })
  })

  it('adds a breadcrumb list with positions', () => {
    expect(breadcrumbs).toMatchObject({ '@type': 'BreadcrumbList' })
    expect(breadcrumbs.itemListElement.map((i) => i.position)).toEqual([1, 2])
  })
})
