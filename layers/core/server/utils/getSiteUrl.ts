import type { H3Event } from 'h3'
import { toSiteOrigins, type SiteOrigins } from '#layers/core/shared/utils/siteOrigins'

export function getSiteOrigins(event: H3Event): SiteOrigins {
  return toSiteOrigins(useRuntimeConfig(event).public)
}

/** The official origin of `locale`; EN is the primary domain. */
export function getSiteUrl(event: H3Event, locale: 'ro' | 'en' = 'en'): string {
  return getSiteOrigins(event)[locale]
}
