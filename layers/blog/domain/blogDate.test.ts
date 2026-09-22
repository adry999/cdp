import { describe, expect, it } from 'vitest'
import { formatPostDate } from './blogDate'

describe('formatPostDate', () => {
  it('formats in Romanian for ro', () => {
    expect(formatPostDate('2026-09-22', 'ro')).toBe('22 septembrie 2026')
  })

  it('formats in English for en', () => {
    expect(formatPostDate('2026-09-22', 'en')).toBe('September 22, 2026')
  })
})
