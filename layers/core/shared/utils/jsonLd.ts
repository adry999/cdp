// schema.org JSON-LD builders; each returns a plain object to stringify into a ld+json script.

export interface BreadcrumbItem {
  name: string
  url: string
}

export function breadcrumbList(items: readonly BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function organizationRef(siteUrl: string) {
  return { '@type': 'Organization', name: 'CODEPEDIA', url: siteUrl }
}

export interface StudioGraphInput {
  /** The official origin of the page's locale. */
  origin: string
  /** Raster logo URL, square and at least 112 px (what Google accepts). */
  logoUrl: string
  email: string
  /** City and ISO country code of the headquarters; no street address is published. */
  locality: string
  country: string
  areaServed: readonly string[]
  languages: readonly string[]
  serviceNames: readonly string[]
}

/** The studio as an `Organization` plus the `ProfessionalService` (a `LocalBusiness`) that belongs to it. */
export function studioGraph(input: StudioGraphInput) {
  const orgId = `${input.origin}/#org`
  const address = { '@type': 'PostalAddress', addressLocality: input.locality, addressCountry: input.country }
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: 'CODEPEDIA',
        url: input.origin,
        logo: { '@type': 'ImageObject', url: input.logoUrl, width: 512, height: 512 },
        email: input.email,
        address,
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${input.origin}/#business`,
        name: 'CODEPEDIA',
        url: input.origin,
        image: input.logoUrl,
        parentOrganization: { '@id': orgId },
        address,
        areaServed: input.areaServed,
        knowsLanguage: input.languages,
        makesOffer: input.serviceNames.map((name) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name },
        })),
      },
    ],
  }
}

export function webSite(siteUrl: string, inLanguage: readonly string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CODEPEDIA',
    url: siteUrl,
    inLanguage: [...inLanguage],
  }
}

export interface FaqEntry {
  question: string
  answer: string
}

export function faqPage(items: readonly FaqEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}
