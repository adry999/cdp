import { describe, expect, it } from 'vitest'
import { nextTabIndex } from './nextTabIndex'

describe('nextTabIndex', () => {
  it.each([
    ['ArrowRight', 0, 1],
    ['ArrowRight', 2, 0],
    ['ArrowDown', 1, 2],
    ['ArrowLeft', 0, 2],
    ['ArrowUp', 2, 1],
    ['Home', 2, 0],
    ['End', 0, 2],
  ])('%s from %i goes to %i', (key, current, expected) => {
    expect(nextTabIndex(key, current, 3)).toBe(expected)
  })

  it('ignores other keys', () => {
    expect(nextTabIndex('Enter', 0, 3)).toBeNull()
  })

  it('in horizontal-only mode ignores vertical and Home/End keys', () => {
    expect(nextTabIndex('ArrowRight', 1, 2, true)).toBe(0)
    expect(nextTabIndex('ArrowLeft', 0, 2, true)).toBe(1)
    for (const key of ['ArrowUp', 'ArrowDown', 'Home', 'End']) expect(nextTabIndex(key, 0, 2, true)).toBeNull()
  })
})
