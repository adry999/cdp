import { describe, expect, it } from 'vitest'
import {
  QUALIFIER_BUDGET_KEYS,
  STAGE_IDS,
  isQualifierBudgetKey,
  isStageId,
  offerKey,
  resolveRoute,
} from '../../shared/utils/qualifierRouting'

describe('resolveRoute', () => {
  it('routes stage E to mass-market regardless of budget', () => {
    for (const budget of QUALIFIER_BUDGET_KEYS) {
      expect(resolveRoute('E', budget)).toBe('mass-market-express')
    }
  })

  it('routes any sub-1k budget to mass-market regardless of stage', () => {
    for (const stage of STAGE_IDS) {
      expect(resolveRoute(stage, 'under1k')).toBe('mass-market-express')
    }
  })

  it('routes stage A–D with a 1k+ budget to custom engineering / AI', () => {
    for (const stage of ['A', 'B', 'C', 'D'] as const) {
      expect(resolveRoute(stage, '1to2k')).toBe('custom-engineering-ai')
      expect(resolveRoute(stage, '2to5k')).toBe('custom-engineering-ai')
      expect(resolveRoute(stage, 'over5k')).toBe('custom-engineering-ai')
    }
  })
})

describe('offerKey', () => {
  it('uses the shared mass-market card for the express route', () => {
    expect(offerKey('E', 'mass-market-express')).toBe('massMarket')
    expect(offerKey('A', 'mass-market-express')).toBe('massMarket')
  })

  it('frames the custom route per stage', () => {
    expect(offerKey('A', 'custom-engineering-ai')).toBe('fullStack')
    expect(offerKey('B', 'custom-engineering-ai')).toBe('blueprint')
    expect(offerKey('C', 'custom-engineering-ai')).toBe('refactor')
    expect(offerKey('D', 'custom-engineering-ai')).toBe('automation')
  })
})

describe('guards', () => {
  it('isStageId accepts only A–E', () => {
    expect(isStageId('A')).toBe(true)
    expect(isStageId('E')).toBe(true)
    expect(isStageId('F')).toBe(false)
    expect(isStageId('')).toBe(false)
    expect(isStageId(null)).toBe(false)
    expect(isStageId(2)).toBe(false)
  })

  it('isQualifierBudgetKey accepts the four tiers but not unsure', () => {
    expect(isQualifierBudgetKey('under1k')).toBe(true)
    expect(isQualifierBudgetKey('over5k')).toBe(true)
    expect(isQualifierBudgetKey('unsure')).toBe(false)
    expect(isQualifierBudgetKey(undefined)).toBe(false)
  })
})
