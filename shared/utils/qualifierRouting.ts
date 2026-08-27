/**
 * Pure logic for the qualification modal (app/components/site/QualifierModal.vue).
 *
 * Two independent classifications drive the flow:
 *  - the visitor's project *stage* (step 1), each tied to a fixed internal tag
 *  - their *budget* range (step 2), reusing the same keys as the plain contact
 *    form so the admin reads one budget vocabulary regardless of entry point
 *
 * From those two we resolve a single delivery *route*, which decides the offer
 * card shown in step 3 and the "Allocated Route" line in the notification email.
 *
 * Kept framework-free and in shared/ so both the client component and
 * server/api/contact.post.ts import the exact same rules — the server
 * re-derives the tag and route rather than trusting the client payload.
 */

export const STAGE_IDS = ['A', 'B', 'C', 'D', 'E'] as const
export type StageId = (typeof STAGE_IDS)[number]

/** Stable, English, never translated — this is what lands in our inbox / CRM. */
export const STAGE_TAGS: Record<StageId, string> = {
  A: 'Design-to-Code',
  B: 'Concept-to-Spec',
  C: 'Existing-Site-Refactor',
  D: 'Custom-AI-Automation',
  E: 'Mass-Market-Page',
}

/**
 * The modal offers the four concrete tiers only. `unsure` exists on the plain
 * contact form but has no place in a routing decision, so it is deliberately
 * absent here.
 */
export const QUALIFIER_BUDGET_KEYS = ['under1k', '1to2k', '2to5k', 'over5k'] as const
export type QualifierBudgetKey = (typeof QUALIFIER_BUDGET_KEYS)[number]

export type QualifierRoute = 'mass-market-express' | 'custom-engineering-ai'

/** Human-readable route label for the notification email. */
export const ROUTE_LABELS: Record<QualifierRoute, string> = {
  'mass-market-express': 'Mass-Market Express',
  'custom-engineering-ai': 'Custom Engineering / AI',
}

/**
 * Routing rule (docs/superpowers spec, step 2):
 *  - Mass-Market Express  ⟵  stage E ("just a simple page")  OR  budget < 1k
 *  - Custom Engineering/AI ⟵  stage A–D  AND  budget ≥ 1k
 *
 * Stage E can never reach the custom route: a "simple fast page" ask stays on
 * the express track no matter the stated budget.
 */
export function resolveRoute(stage: StageId, budget: QualifierBudgetKey): QualifierRoute {
  if (stage === 'E' || budget === 'under1k') return 'mass-market-express'
  return 'custom-engineering-ai'
}

/**
 * i18n sub-key for the step-3 offer card. Mass-market is one shared card; the
 * custom route is framed per stage so the visitor sees language that matches
 * what they picked in step 1.
 */
export function offerKey(stage: StageId, route: QualifierRoute): string {
  if (route === 'mass-market-express') return 'massMarket'
  const byStage: Record<Exclude<StageId, 'E'>, string> = {
    A: 'fullStack',
    B: 'blueprint',
    C: 'refactor',
    D: 'automation',
  }
  return byStage[stage as Exclude<StageId, 'E'>]
}

export function isStageId(value: unknown): value is StageId {
  return typeof value === 'string' && (STAGE_IDS as readonly string[]).includes(value)
}

export function isQualifierBudgetKey(value: unknown): value is QualifierBudgetKey {
  return typeof value === 'string' && (QUALIFIER_BUDGET_KEYS as readonly string[]).includes(value)
}
