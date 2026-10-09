import { describe, expect, it } from 'vitest'
import { categoryChips, pickRelated } from './post'

const posts = [
  { path: '/a', category: 'COST' as const },
  { path: '/b', category: 'AI' as const },
  { path: '/c', category: 'COST' as const },
  { path: '/d', category: 'IND' as const },
]

describe('pickRelated', () => {
  it('puts the same category first, then the newest, excluding the current post', () => {
    expect(pickRelated(posts, posts[1]!).map((p) => p.path)).toEqual(['/a', '/c'])
    expect(pickRelated(posts, posts[0]!).map((p) => p.path)).toEqual(['/c', '/b'])
  })
})

describe('categoryChips', () => {
  it('lists only categories with posts, in category order', () => {
    expect(categoryChips(posts)).toEqual([
      { code: 'COST', count: 2 },
      { code: 'IND', count: 1 },
      { code: 'AI', count: 1 },
    ])
  })
})
