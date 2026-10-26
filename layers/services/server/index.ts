import type { H3Event } from 'h3'
import { SERVICES } from '#layers/services/data/services'
import { visibleServices } from '#layers/core/shared/utils/visibleServices'
import { servicePages } from '#layers/services/domain/sitemap'

export { SERVICES_INDEX_PAGE } from '#layers/services/domain/sitemap'

export interface LlmsServiceItem {
  slug: string
  name: string
  intro: string
  path: string
  faq?: { question: string; answer: string }[]
}

export function listServicesForLlms(event: H3Event, locale: 'ro' | 'en'): LlmsServiceItem[] {
  const { grantsEnabled } = useRuntimeConfig(event).public
  return visibleServices(SERVICES, grantsEnabled).map((service) => ({
    slug: service.slug,
    name: service.name[locale],
    intro: service.intro[locale],
    path: locale === 'en' ? `/en/services/${service.routeSlug.en}` : `/servicii/${service.routeSlug.ro}`,
    faq: service.faq?.map((f) => ({
      question: f.question[locale],
      answer: f.answer[locale],
    })),
  }))
}

export function listServiceSitemapPages(event: H3Event) {
  const { grantsEnabled } = useRuntimeConfig(event).public
  return servicePages(
    visibleServices(SERVICES, grantsEnabled)
      .map(({ routeSlug }) => routeSlug),
  )
}
