// Framework-free so the modal and POST /api/contact share one rule set; the server
// re-derives tag and route instead of trusting the client payload.

import type { StageId } from '#layers/core/shared/types/service-stage'

/** Stable, English, never translated — this is what lands in our inbox / CRM. */
export const STAGE_TAGS: Record<StageId, string> = {
  A: 'Design-to-Code',
  B: 'Concept-to-Spec',
  C: 'Existing-Site-Refactor',
  D: 'Custom-AI-Automation',
  E: 'Mass-Market-Page',
}

// Concrete tiers only (no `unsure`).
export const QUALIFIER_BUDGET_KEYS = ['under500', '500to1k', '1to2k', '2to5k', 'over5k'] as const
export type QualifierBudgetKey = (typeof QUALIFIER_BUDGET_KEYS)[number]

export type QualifierRoute = 'mass-market-express' | 'custom-engineering-ai'

export const ROUTE_LABELS: Record<QualifierRoute, string> = {
  'mass-market-express': 'Mass-Market Express',
  'custom-engineering-ai': 'Custom Engineering / AI',
}

// Stage E always routes express regardless of budget; otherwise express only below 1k.
const SUB_1K: readonly QualifierBudgetKey[] = ['under500', '500to1k']

export function resolveRoute(stage: StageId, budget: QualifierBudgetKey): QualifierRoute {
  if (stage === 'E' || SUB_1K.includes(budget)) return 'mass-market-express'
  return 'custom-engineering-ai'
}

// Mass-market is one shared card; the custom route is framed per stage.
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

export function isQualifierBudgetKey(value: unknown): value is QualifierBudgetKey {
  return typeof value === 'string' && (QUALIFIER_BUDGET_KEYS as readonly string[]).includes(value)
}
