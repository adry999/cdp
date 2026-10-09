import type { StageId } from '#layers/core/shared/types/service-stage'

// Route slug (either locale) -> the qualifier stage of that service. Mirrors `qualifierStage` in
// `layers/services/data/serviceLinks.ts` (a test there keeps the two in step). It lives in core so the
// contact form can pre-select a stage from a blog CTA link without depending on `services`.
const SERVICE_ROUTE_STAGES: Readonly<Record<string, StageId>> = {
  website: 'E',
  'aplicatie-web': 'A',
  'web-app': 'A',
  wordpress: 'E',
  shopify: 'E',
  'automatizare-ai': 'D',
  'ai-automation': 'D',
  granturi: 'A',
  grants: 'A',
}

/** The stage for a `?serviciu=` / `?service=` value (RO or EN route slug); undefined when unknown. */
export function stageForServiceParam(value: unknown): StageId | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return undefined
  return Object.hasOwn(SERVICE_ROUTE_STAGES, raw) ? SERVICE_ROUTE_STAGES[raw] : undefined
}
