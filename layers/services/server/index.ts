import { SERVICES } from '#layers/services/data/services'
import { servicePages } from '#layers/services/domain/sitemap'

export { SERVICES_INDEX_PAGE } from '#layers/services/domain/sitemap'

export const SERVICE_SITEMAP_PAGES = servicePages(SERVICES.map(({ routeSlug }) => routeSlug))
