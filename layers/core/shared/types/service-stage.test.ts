import { describe, expect, it } from 'vitest'
import { STAGE_IDS, STAGE_ORDER, isStageId } from './service-stage'

describe('STAGE_ORDER', () => {
  it('is a permutation of every stage id', () => {
    expect([...STAGE_ORDER].sort()).toEqual([...STAGE_IDS].sort())
  })

  it('leads with the mass-market page and ends with custom AI', () => {
    expect(STAGE_ORDER[0]).toBe('E')
    expect(STAGE_ORDER[STAGE_ORDER.length - 1]).toBe('D')
  })
})

describe('isStageId', () => {
  it('accepts only A–E', () => {
    expect(isStageId('A')).toBe(true)
    expect(isStageId('E')).toBe(true)
    expect(isStageId('F')).toBe(false)
    expect(isStageId('')).toBe(false)
    expect(isStageId(null)).toBe(false)
    expect(isStageId(2)).toBe(false)
  })
})
