import { describe, expect, it } from 'vitest'
import { moveItem } from './moveItem'

describe('moveItem', () => {
  it('moves an item forward', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd'])
  })

  it('moves an item backward', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c'])
  })

  it('keeps the order when from equals to', () => {
    expect(moveItem(['a', 'b', 'c'], 1, 1)).toEqual(['a', 'b', 'c'])
  })

  it('returns an unchanged copy when from is out of range', () => {
    const list = ['a', 'b']
    const result = moveItem(list, 5, 0)
    expect(result).toEqual(['a', 'b'])
    expect(result).not.toBe(list)
  })

  it('does not mutate its input', () => {
    const list = ['a', 'b', 'c']
    moveItem(list, 0, 2)
    expect(list).toEqual(['a', 'b', 'c'])
  })
})
