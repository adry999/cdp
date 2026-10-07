import { SERVICES } from '#layers/services/data/services'
import { servicePages } from '#layers/services/domain/sitemap'

export { SERVICES_INDEX_PAGE } from '#layers/services/domain/sitemap'

export const SERVICE_SITEMAP_PAGES = servicePages(
  SERVICES
    .filter((s) => s.slug !== 'granturi' || process.env.NUXT_PUBLIC_GRANTS_ENABLED === 'true')
    .map(({ routeSlug }) => routeSlug)
)
