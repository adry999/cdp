import { breadcrumbList, organizationRef } from '#layers/core/shared/utils/jsonLd'

export interface ServiceJsonLdInput {
  name: string
  description: string
  /** Absolute URL of the service page in the current locale. */
  url: string
  /** Absolute origin of the primary site, the Organization's url. */
  primaryOrigin: string
  crumbs: readonly { name: string, url: string }[]
}

// The studio is based in Chișinău and delivers remotely; Moldova is the only market stated on the site.
const AREA_SERVED = { '@type': 'Country', name: 'Moldova' }

export function serviceJsonLd(input: ServiceJsonLdInput) {
  return {
    service: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: input.name,
      description: input.description,
      url: input.url,
      provider: organizationRef(input.primaryOrigin),
      areaServed: AREA_SERVED,
    },
    breadcrumbs: breadcrumbList(input.crumbs),
  }
}
