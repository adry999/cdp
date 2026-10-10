import type { H3Event } from 'h3'
import { SERVICES } from '#layers/services/data/services'
import { servicePages } from '#layers/services/domain/sitemap'

export { SERVICES_INDEX_PAGE } from '#layers/services/domain/sitemap'

export function listServiceSitemapPages(event: H3Event) {
  const { grantsEnabled } = useRuntimeConfig(event).public
  return servicePages(
    SERVICES
      .filter((s) => s.slug !== 'granturi' || grantsEnabled)
      .map(({ routeSlug }) => routeSlug),
  )
}
