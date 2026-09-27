import type { Service } from '#layers/services/domain/service'

export type ServiceLink = Pick<Service, 'slug' | 'routeSlug' | 'name' | 'qualifierStage'>

// Kept apart from SERVICES so the sitewide footer doesn't ship full page copy.
export const SERVICE_LINKS: readonly ServiceLink[] = [
  { slug: 'website', routeSlug: { ro: 'website', en: 'website' }, name: { ro: 'Website', en: 'Website' }, qualifierStage: 'E' },
  { slug: 'web-app', routeSlug: { ro: 'aplicatie-web', en: 'web-app' }, name: { ro: 'Aplicație web', en: 'Web app' }, qualifierStage: 'A' },
  { slug: 'wordpress', routeSlug: { ro: 'wordpress', en: 'wordpress' }, name: { ro: 'WordPress', en: 'WordPress' }, qualifierStage: 'E' },
  { slug: 'shopify', routeSlug: { ro: 'shopify', en: 'shopify' }, name: { ro: 'Shopify', en: 'Shopify' }, qualifierStage: 'E' },
  { slug: 'ai-automation', routeSlug: { ro: 'automatizare-ai', en: 'ai-automation' }, name: { ro: 'Automatizare cu AI', en: 'AI automation' }, qualifierStage: 'D' },
]
