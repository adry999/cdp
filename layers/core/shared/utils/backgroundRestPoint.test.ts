import { describe, expect, it } from 'vitest'
import { backgroundRestPoint } from './backgroundRestPoint'

describe('backgroundRestPoint', () => {
  it('rests in the top-right corner on a desktop hero', () => {
    const point = backgroundRestPoint(1440, 800)
    expect(point.x).toBeCloseTo(1353.6)
    expect(point.y).toBeCloseTo(86.4)
  })

  it('caps the inset on very wide boxes', () => {
    expect(backgroundRestPoint(2400, 900)).toEqual({ x: 2310, y: 90 })
  })

  it('hugs the corner on a phone, away from the text', () => {
    const point = backgroundRestPoint(390, 1100)
    expect(point.x).toBeCloseTo(366.6)
    expect(point.y).toBeCloseTo(23.4)
  })

  it('stays inside a short box', () => {
    const point = backgroundRestPoint(1200, 60)
    expect(point).toEqual({ x: 1170, y: 30 })
  })
})
