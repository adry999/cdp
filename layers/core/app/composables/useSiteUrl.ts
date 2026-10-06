import { toSiteOrigins } from '#layers/core/shared/utils/siteOrigins'

/** The official origin of the current locale, or of `locale` when given. */
export function useSiteUrl(locale?: SiteLocale): string {
  const origins = toSiteOrigins(useRuntimeConfig().public)
  return origins[locale ?? useSiteLocale().value]
}
