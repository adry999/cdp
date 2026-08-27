/**
 * Pure logic for the qualification modal (app/components/site/QualifierModal.vue).
 *
 * Two independent classifications drive the flow:
 *  - the visitor's project *stage* (step 1), each tied to a fixed internal tag
 *  - their *budget* range (step 2). The sub-1k band is split finer than the
 *    plain contact form's (`under500` / `500to1k` vs a single `under1k`);
 *    leadLabels.ts carries labels for all of them so the admin still reads one
 *    vocabulary.
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

/**
 * Display order for step 1: lightest / cheapest engagement first, most involved
 * last (simple page → scoping → build from designs → work inside a live
 * codebase → custom AI engineering). The tag IDs above stay canonical; only
 * the order the cards render in changes.
 */
export const STAGE_ORDER = ['E', 'B', 'A', 'C', 'D'] as const satisfies readonly StageId[]

/** Stable, English, never translated — this is what lands in our inbox / CRM. */
export const STAGE_TAGS: Record<StageId, string> = {
  A: 'Design-to-Code',
  B: 'Concept-to-Spec',
  C: 'Existing-Site-Refactor',
  D: 'Custom-AI-Automation',
  E: 'Mass-Market-Page',
}

/**
 * The modal offers concrete tiers only — no `unsure`, and the low end is split
 * into `under500` / `500to1k` so a small-budget visitor lands somewhere exact.
 */
export const QUALIFIER_BUDGET_KEYS = ['under500', '500to1k', '1to2k', '2to5k', 'over5k'] as const
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
 * The < 1k boundary is unchanged by the finer low-end tiers: both `under500`
 * and `500to1k` sit below it and route to express. Stage E can never reach the
 * custom route — a "simple fast page" ask stays on the express track no matter
 * the stated budget.
 */
const SUB_1K: readonly QualifierBudgetKey[] = ['under500', '500to1k']

export function resolveRoute(stage: StageId, budget: QualifierBudgetKey): QualifierRoute {
  if (stage === 'E' || SUB_1K.includes(budget)) return 'mass-market-express'
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
