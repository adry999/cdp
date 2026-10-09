import type { SitemapPage } from '#layers/core/shared/types/sitemap'
import type { LocalizedText } from '#layers/core/shared/types/localizedText'
import { isEnPendingPath } from '#layers/core/shared/utils/enPendingTranslation'

// Kept apart from SERVICES so the client can read it without loading the
// service data.
export const SERVICES_EN_PENDING_PATHS: readonly string[] = []

export const SERVICES_INDEX_PAGE: SitemapPage = {
  ro: '/servicii',
  en: '/en/services',
  enPending: isEnPendingPath(SERVICES_EN_PENDING_PATHS, '/servicii'),
}

export function servicePages(routeSlugs: readonly LocalizedText[]): SitemapPage[] {
  return routeSlugs.map((slug) => {
    const ro = `/servicii/${slug.ro}`
    return { ro, en: `/en/services/${slug.en}`, enPending: isEnPendingPath(SERVICES_EN_PENDING_PATHS, ro) }
  })
}
