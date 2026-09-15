import { describe, expect, it } from 'vitest'
import { STAGE_IDS } from '#layers/core/shared/types/service-stage'
import {
  QUALIFIER_BUDGET_KEYS,
  isQualifierBudgetKey,
  offerKey,
  resolveRoute,
} from './routing'

describe('resolveRoute', () => {
  it('routes stage E to mass-market regardless of budget', () => {
    for (const budget of QUALIFIER_BUDGET_KEYS) {
      expect(resolveRoute('E', budget)).toBe('mass-market-express')
    }
  })

  it('routes any sub-1k budget to mass-market regardless of stage', () => {
    for (const stage of STAGE_IDS) {
      expect(resolveRoute(stage, 'under500')).toBe('mass-market-express')
      expect(resolveRoute(stage, '500to1k')).toBe('mass-market-express')
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
  it('isQualifierBudgetKey accepts the modal tiers but not under1k or unsure', () => {
    expect(isQualifierBudgetKey('under500')).toBe(true)
    expect(isQualifierBudgetKey('500to1k')).toBe(true)
    expect(isQualifierBudgetKey('over5k')).toBe(true)
    expect(isQualifierBudgetKey('under1k')).toBe(false)
    expect(isQualifierBudgetKey('unsure')).toBe(false)
    expect(isQualifierBudgetKey(undefined)).toBe(false)
  })
})
