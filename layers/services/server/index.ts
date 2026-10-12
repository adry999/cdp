import type { H3Event } from 'h3'
import { SERVICES } from '#layers/services/data/services'
import { visibleServices } from '#layers/core/shared/utils/visibleServices'
import { servicePages } from '#layers/services/domain/sitemap'

export { SERVICES_INDEX_PAGE } from '#layers/services/domain/sitemap'

export function listServiceSitemapPages(event: H3Event) {
  const { grantsEnabled } = useRuntimeConfig(event).public
  return servicePages(
    visibleServices(SERVICES, grantsEnabled)
      .map(({ routeSlug }) => routeSlug),
  )
}
