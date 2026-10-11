import type { StageId } from '#layers/core/shared/types/service-stage'
import type { ServiceTagId } from '#layers/core/shared/types/service-tag'

// Route slug (either locale) -> service. Mirrors `routeSlug` in `layers/services/data/serviceLinks.ts`
// (a test there keeps the two in step). It lives in core so the contact form can pre-select a service
// from a route or a blog CTA link without depending on `services`.
const SERVICE_ROUTE_TAGS: Readonly<Record<string, ServiceTagId>> = {
  website: 'website',
  'aplicatie-web': 'web-app',
  'web-app': 'web-app',
  wordpress: 'wordpress',
  shopify: 'shopify',
  'automatizare-ai': 'ai-automation',
  'ai-automation': 'ai-automation',
  granturi: 'granturi',
  grants: 'granturi',
}

// Service -> qualifier stage. Mirrors `qualifierStage` in `serviceLinks.ts`, same test.
const SERVICE_STAGES: Readonly<Record<ServiceTagId, StageId>> = {
  website: 'E',
  'web-app': 'A',
  wordpress: 'E',
  shopify: 'E',
  'ai-automation': 'D',
  granturi: 'A',
}

export function stageForServiceTag(tag: ServiceTagId): StageId {
  return SERVICE_STAGES[tag]
}

/** The service for a route slug or a `?serviciu=` / `?service=` value (RO or EN); undefined when unknown. */
export function serviceTagForParam(value: unknown): ServiceTagId | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return undefined
  return Object.hasOwn(SERVICE_ROUTE_TAGS, raw) ? SERVICE_ROUTE_TAGS[raw] : undefined
}

/** The stage for a `?serviciu=` / `?service=` value (RO or EN route slug); undefined when unknown. */
export function stageForServiceParam(value: unknown): StageId | undefined {
  const tag = serviceTagForParam(value)
  return tag ? SERVICE_STAGES[tag] : undefined
}
