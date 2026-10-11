import { describe, expect, it } from 'vitest'
import { breadcrumbList, faqPage, organizationRef, studioGraph, webSite } from './jsonLd'

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

describe('organizationRef', () => {
  it('names CODEPEDIA with the site url', () => {
    expect(organizationRef('https://codepedia.md')).toEqual({
      '@type': 'Organization',
      name: 'CODEPEDIA',
      url: 'https://codepedia.md',
    })
  })
})

describe('webSite', () => {
  it('names CODEPEDIA with the site url and both languages', () => {
    expect(webSite('https://codepedia.md', ['ro', 'en'])).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'CODEPEDIA',
      url: 'https://codepedia.md',
      inLanguage: ['ro', 'en'],
    })
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

  it('lists each service as an offer and publishes no street address, phone or geo', () => {
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
})
