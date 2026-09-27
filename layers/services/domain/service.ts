import type { LocalizedText } from '#layers/core/shared/types/localizedText'
import type { ServiceTagId } from '#layers/core/shared/types/service-tag'
import type { StageId } from '#layers/core/shared/types/service-stage'

export interface ServiceProcessStep {
  title: LocalizedText
  body: LocalizedText
}

// `priceFrom` starts null for all entries (no invented numbers per spec); the page hides
// the price line when it's null.
export interface Service {
  /** Canonical id — matches `projects.service_tag` and the admin select. Not the URL slug. */
  slug: ServiceTagId
  /** Localized route slugs for `/servicii/[slug]` (ro) and `/en/services/[slug]` (en). */
  routeSlug: LocalizedText
  name: LocalizedText
  intro: LocalizedText
  features: LocalizedText[]
  process: ServiceProcessStep[]
  priceFrom: string | null
  qualifierStage: StageId
}
