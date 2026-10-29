import { describe, expect, it } from 'vitest'
import { breadcrumbList, collectionPage, faqPage, organizationRef, studioGraph, webSite } from './jsonLd'

describe('breadcrumbList', () => {
  it('numbers the items from 1 in order', () => {
    expect(
      breadcrumbList([
        { name: 'CODEPEDIA', url: 'https://codepedia.md/' },
        { name: 'Servicii', url: 'https://codepedia.md/servicii' },
      ]),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'CODEPEDIA', item: 'https://codepedia.md/' },
        { '@type': 'ListItem', position: 2, name: 'Servicii', item: 'https://codepedia.md/servicii' },
      ],
    })
  })
})

describe('collectionPage', () => {
  it('pairs a CollectionPage with an ItemList numbered from 1', () => {
    expect(
      collectionPage({
        name: 'Proiecte',
        description: 'd',
        url: 'https://codepedia.md/proiecte',
        inLanguage: 'ro',
        items: [
          { name: 'A', url: 'https://codepedia.md/proiecte/a' },
          { name: 'B', url: 'https://codepedia.md/proiecte/b' },
        ],
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'CollectionPage', name: 'Proiecte', description: 'd', url: 'https://codepedia.md/proiecte', inLanguage: 'ro' },
        {
          '@type': 'ItemList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, url: 'https://codepedia.md/proiecte/a', name: 'A' },
            { '@type': 'ListItem', position: 2, url: 'https://codepedia.md/proiecte/b', name: 'B' },
          ],
        },
      ],
    })
  })
})

describe('organizationRef', () => {
  it('names CODEPEDIA with the site url and canonical @id', () => {
    expect(organizationRef('https://codepedia.md')).toEqual({
      '@type': 'Organization',
      '@id': 'https://codepedia.md/#org',
      name: 'CODEPEDIA',
      url: 'https://codepedia.md',
    })
  })
})

describe('webSite', () => {
  it('names CODEPEDIA with the site url, canonical @id and publisher reference', () => {
    expect(webSite('https://codepedia.md', ['ro', 'en'])).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': 'https://codepedia.md/#website',
      name: 'CODEPEDIA',
      url: 'https://codepedia.md',
      inLanguage: ['ro', 'en'],
      publisher: {
        '@id': 'https://codepedia.md/#org',
      },
    })
  })
})

describe('webSite per origin', () => {
  it('derives the @id from its own url and points the publisher at the primary org', () => {
    const ro = webSite('https://codepedia.md', ['ro'], 'https://codepedia.studio')
    const en = webSite('https://codepedia.studio', ['en'], 'https://codepedia.studio')
    expect(ro['@id']).toBe('https://codepedia.md/#website')
    expect(en['@id']).toBe('https://codepedia.studio/#website')
    expect(ro.publisher).toEqual(en.publisher)
    expect(ro.publisher['@id']).toBe('https://codepedia.studio/#org')
  })
})

describe('faqPage', () => {
  it('maps each entry to a Question with an accepted Answer', () => {
    expect(faqPage([{ question: 'Cât durează?', answer: 'Două săptămâni.' }])).toEqual({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Cât durează?',
          acceptedAnswer: { '@type': 'Answer', text: 'Două săptămâni.' },
        },
      ],
    })
  })
})

describe('studioGraph', () => {
  const graph = studioGraph({
    origin: 'https://codepedia.md',
    logoUrl: 'https://codepedia.md/icon-512.png',
    email: 'contact@codepedia.md',
    locality: 'Chișinău',
    country: 'MD',
    areaServed: ['MD', 'RO'],
    languages: ['ro', 'en'],
    serviceNames: ['Website', 'Web app'],
  })
  const [organization, business] = graph['@graph']

  it('declares one Organization and one business that points back to it', () => {
    expect(graph['@graph'].map((node) => node['@type'])).toEqual(['Organization', 'ProfessionalService'])
    expect(organization?.['@id']).toBe('https://codepedia.md/#org')
    expect(business).toMatchObject({ '@id': 'https://codepedia.md/#business', parentOrganization: { '@id': 'https://codepedia.md/#org' } })
  })

  it('lists each service as an offer and publishes no street address or geo', () => {
    expect(business).toMatchObject({
      makesOffer: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Website' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Web app' } },
      ],
      address: { '@type': 'PostalAddress', addressLocality: 'Chișinău', addressCountry: 'MD' },
    })
    const text = JSON.stringify(graph)
    expect(text).not.toMatch(/streetAddress|telephone|geo|openingHours/)
  })

  it('adds phone and opening hours only when given', () => {
    const withContact = studioGraph({
      origin: 'https://codepedia.md',
      logoUrl: 'https://codepedia.md/icon-512.png',
      email: 'contact@codepedia.md',
      telephone: '+37369117329',
      openingHours: { days: ['Monday', 'Friday'], opens: '09:00', closes: '18:00' },
      locality: 'Chișinău',
      country: 'MD',
      areaServed: ['MD'],
      languages: ['ro'],
      serviceNames: [],
    })
    const [org, biz] = withContact['@graph']
    expect(org).toMatchObject({ telephone: '+37369117329' })
    expect(biz).toMatchObject({
      telephone: '+37369117329',
      openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Friday'], opens: '09:00', closes: '18:00' },
    })
    expect(JSON.stringify(withContact)).not.toMatch(/streetAddress|geo/)
  })
})
