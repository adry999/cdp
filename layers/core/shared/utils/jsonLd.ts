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

export const AREA_SERVED = ['MD', 'RO', 'EU', 'US', 'CA'] as const

/** Canonical @id of the studio organization, anchored on the primary EN domain. */
export const orgId = (primaryOrigin: string) => `${primaryOrigin}/#org`

export function organizationRef(primaryOrigin: string) {
  return { '@type': 'Organization', '@id': orgId(primaryOrigin), name: 'CODEPEDIA', url: primaryOrigin }
}

export interface StudioGraphInput {
  /** The official origin of the page's locale. */
  origin: string
  /** The primary (EN) origin where the canonical Organization entity lives. Defaults to origin. */
  primaryOrigin?: string
  /** Raster logo URL, square and at least 112 px (what Google accepts). */
  logoUrl: string
  email: string
  /** City and ISO country code of the headquarters; no street address is published. */
  locality: string
  country: string
  areaServed: readonly string[]
  languages: readonly string[]
  serviceNames: readonly string[]
  sameAs?: readonly string[]
  description?: string
  legalName?: string
}

/** The studio as an `Organization` plus the `ProfessionalService` (a `LocalBusiness`) that belongs to it. */
export function studioGraph(input: StudioGraphInput) {
  const primary = input.primaryOrigin ?? input.origin
  const canonicalOrgId = orgId(primary)
  const businessId = `${input.origin}/#business`
  const address = { '@type': 'PostalAddress', addressLocality: input.locality, addressCountry: input.country }
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': canonicalOrgId,
        name: 'CODEPEDIA',
        alternateName: 'Codepedia',
        ...(input.legalName ? { legalName: input.legalName } : {}),
        url: primary,
        logo: { '@type': 'ImageObject', url: input.logoUrl, width: 512, height: 512 },
        email: input.email,
        address,
        ...(input.description ? { description: input.description } : {}),
        ...(input.sameAs && input.sameAs.length > 0 ? { sameAs: [...input.sameAs] } : {}),
      },
      {
        '@type': 'ProfessionalService',
        '@id': businessId,
        name: 'CODEPEDIA',
        url: input.origin,
        image: input.logoUrl,
        parentOrganization: { '@id': canonicalOrgId },
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

export function webSite(siteUrl: string, inLanguage: readonly string[], primaryOrigin?: string) {
  const primary = primaryOrigin ?? siteUrl
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${primary}/#website`,
    name: 'CODEPEDIA',
    url: siteUrl,
    inLanguage: [...inLanguage],
    publisher: { '@id': orgId(primary) },
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
