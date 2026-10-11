import { describe, expect, it } from 'vitest'
import { readingProgress } from './readingProgress'

describe('readingProgress', () => {
  it('is 0 at the top, 0.5 halfway and 1 at the bottom', () => {
    expect(readingProgress(0, 3000, 1000)).toBe(0)
    expect(readingProgress(1000, 3000, 1000)).toBe(0.5)
    expect(readingProgress(2000, 3000, 1000)).toBe(1)
  })

  it('clamps overscroll to the 0-1 range', () => {
    expect(readingProgress(-40, 3000, 1000)).toBe(0)
    expect(readingProgress(2400, 3000, 1000)).toBe(1)
  })

  it('is 0 when the page is not scrollable', () => {
    expect(readingProgress(0, 800, 1000)).toBe(0)
    expect(readingProgress(0, 1000, 1000)).toBe(0)
  })
})
