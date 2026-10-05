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
  /** `<title>` and og:title — search keywords, unlike the short display `name`. */
  seoTitle: LocalizedText
  intro: LocalizedText
  /** Meta description when `intro` is too short for a search snippet; falls back to `intro`. */
  seoDescription?: LocalizedText
  /** Who the service is for; rendered as "Pentru" chips in the hero. Optional — most services omit it. */
  audience?: LocalizedText[]
  features: LocalizedText[]
  process: ServiceProcessStep[]
  priceFrom: string | null
  qualifierStage: StageId
}
