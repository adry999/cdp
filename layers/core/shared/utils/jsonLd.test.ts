import { describe, expect, it } from 'vitest'
import { breadcrumbList, faqPage, organizationRef } from './jsonLd'

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
