import { describe, expect, it } from 'vitest'
import { breadcrumbList, organizationRef } from './jsonLd'

describe('breadcrumbList', () => {
  it('numbers the items from 1 in order', () => {
    expect(
      breadcrumbList([
        { name: 'Codepedia', url: 'https://codepedia.md/' },
        { name: 'Servicii', url: 'https://codepedia.md/servicii' },
      ]),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Codepedia', item: 'https://codepedia.md/' },
        { '@type': 'ListItem', position: 2, name: 'Servicii', item: 'https://codepedia.md/servicii' },
      ],
    })
  })
})

describe('organizationRef', () => {
  it('names Codepedia with the site url', () => {
    expect(organizationRef('https://codepedia.md')).toEqual({
      '@type': 'Organization',
      name: 'Codepedia',
      url: 'https://codepedia.md',
    })
  })
})
