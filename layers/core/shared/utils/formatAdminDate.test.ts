import { describe, expect, it } from 'vitest'
import { formatAdminDate } from './formatAdminDate'

describe('formatAdminDate', () => {
  it('formats a date in Chisinau time', () => {
    expect(formatAdminDate('2026-06-15T12:00:00Z')).toBe('15.06.2026')
  })

  it('rolls into the next local day when UTC is just before midnight', () => {
    // 22:30 UTC is 01:30 the next day in Chisinau (UTC+3 in summer).
    expect(formatAdminDate('2026-06-15T22:30:00Z')).toBe('16.06.2026')
    // Winter, UTC+2.
    expect(formatAdminDate('2026-01-15T22:30:00Z')).toBe('16.01.2026')
  })

  it('includes the local time on request', () => {
    expect(formatAdminDate('2026-06-15T22:30:00Z', { withTime: true })).toMatch(/^16\.06\.2026,? 01:30:00$/)
  })

  it('returns an empty string for an invalid date', () => {
    expect(formatAdminDate('nope')).toBe('')
  })
})
