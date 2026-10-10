import { describe, expect, it } from 'vitest'
import { parseColorToRgb } from './parseColorToRgb'

describe('parseColorToRgb', () => {
  it('reads long and short hex', () => {
    expect(parseColorToRgb('#FF4D14')).toEqual([255, 77, 20])
    expect(parseColorToRgb(' #fa0 ')).toEqual([255, 170, 0])
  })

  it('reads rgb and rgba', () => {
    expect(parseColorToRgb('rgb(11, 11, 11)')).toEqual([11, 11, 11])
    expect(parseColorToRgb('rgba(250, 248, 244, 0.18)')).toEqual([250, 248, 244])
  })

  it('returns null for anything else', () => {
    expect(parseColorToRgb('')).toBeNull()
    expect(parseColorToRgb('red')).toBeNull()
    expect(parseColorToRgb('rgb(300, 0, 0)')).toBeNull()
  })
})
