import type { StageIconName } from '~/components/site/QualifierStageIcon.vue'
import type { StageId } from '~~/shared/utils/qualifierRouting'

/**
 * The homepage "growth timeline" (section 01, HomeServices.vue) is a visual
 * re-presentation of the same five project stages the qualifier modal routes on
 * (shared/utils/qualifierRouting.ts). Copy — stage label, the client's reality,
 * what we deliver, indicative budget · timeline — is pulled from the shared
 * `qualifier.*` i18n block at render time (see useServiceStages), so the two
 * surfaces can never drift and no figure is duplicated here.
 *
 * Only the tech badges live in this file: they are product names, never
 * translated, and the qualifier flow has no field for them.
 */

/** Static, non-translatable part of one milestone node, keyed by stage id. */
export interface ServiceStageDef {
  id: StageId
  /** Inlined Lucide glyph — must stay in sync with QualifierStepStage.vue. */
  icon: StageIconName
  /** i18n sub-key under `qualifier.offer.*` for the card headline + blurb. */
  offerKey: 'massMarket' | 'fullStack' | 'blueprint' | 'refactor' | 'automation'
  badges: string[]
}

/** A milestone node with its copy resolved for the active locale. */
export interface ServiceStage extends ServiceStageDef {
  /** Short client-facing label — qualifier.offer.<offerKey>.kicker. */
  stageLabel: string
  /** Card headline — qualifier.offer.<offerKey>.title. */
  title: string
  /** The client's situation — qualifier.stage.options.<id>.title. */
  clientReality: string
  /** What we deliver — qualifier.stage.options.<id>.hint. */
  delivery: string
  /** Indicative "budget · timeline" — qualifier.stage.options.<id>.{budget,timeline}. */
  priceOrTime: string
}

/**
 * Ordered lightest engagement first, matching the qualifier's STAGE_ORDER
 * (simple page → scoping → build from designs → work in a live codebase →
 * custom AI). Badge lists mirror the "Delivery" line of each stage.
 */
export const SERVICE_STAGE_DEFS: readonly ServiceStageDef[] = [
  { id: 'E', icon: 'file-text', offerKey: 'massMarket', badges: ['Next.js / Nuxt', 'Tailwind', 'Email APIs'] },
  { id: 'B', icon: 'lightbulb', offerKey: 'blueprint', badges: ['AI Prototyping', 'Wireframing', 'Product Scope'] },
  { id: 'A', icon: 'shapes', offerKey: 'fullStack', badges: ['React / Next', 'Vue / Nuxt', 'Shadcn UI', 'PostgreSQL / Supabase'] },
  { id: 'C', icon: 'gauge', offerKey: 'refactor', badges: ['C# / .NET', 'Node.js', 'NestJS', 'Postgres tuning'] },
  { id: 'D', icon: 'bot', offerKey: 'automation', badges: ['Claude API', 'Gemini API', 'n8n', 'Make', 'Retool'] },
] as const

export type { StageId }
