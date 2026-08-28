import type { StageIconName } from '~/components/site/QualifierStageIcon.vue'
import type { StageId } from '~~/shared/utils/qualifierRouting'

/**
 * Structural definition of the homepage "growth timeline" (section 01,
 * HomeServices.vue): the five milestone nodes, in display order, each mapping a
 * qualifier stage id to its timeline icon.
 *
 * ALL panel copy — stage name, price · timeline, the "where you are" and "what
 * you get" lines, the chips — lives in ONE place:
 *
 *     i18n/locales/{ro,en}.json  →  home.services
 *
 * Edit or add entries there. This file only owns node order + icon wiring; it
 * holds no text. See useServiceStages() for how the two are joined.
 */
export interface ServiceStageDef {
  /** Qualifier stage id — routes the "start here" CTA and keys the i18n copy. */
  id: StageId
  /** Inlined Lucide glyph — must stay in sync with QualifierStageIcon.vue. */
  icon: StageIconName
}

/** A milestone node with its `home.services.stages.<id>` copy resolved. */
export interface ServiceStage extends ServiceStageDef {
  /** Stage name — shown on the node and as the panel heading. */
  name: string
  /** Indicative "budget · timeline", e.g. "Under 1,000 EUR · 2–3 days". */
  priceTime: string
  /** The client's situation, shown under the "Where you are" label. */
  whereYouAre: string
  /** What we deliver, shown under the "What you get" label. */
  whatYouGet: string
  /** Value chips. */
  badges: string[]
  /** Label for this panel's CTA button (opens the qualifier at this stage). */
  cta: string
}

/**
 * Ordered lightest engagement first, matching the qualifier's STAGE_ORDER
 * (simple page → scoping → build from designs → work in a live codebase →
 * custom AI).
 */
export const SERVICE_STAGE_DEFS: readonly ServiceStageDef[] = [
  { id: 'E', icon: 'file-text' },
  { id: 'B', icon: 'lightbulb' },
  { id: 'A', icon: 'shapes' },
  { id: 'C', icon: 'gauge' },
  { id: 'D', icon: 'bot' },
] as const

export type { StageId }
