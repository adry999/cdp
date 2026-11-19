import { describe, expect, it } from 'vitest'
import { leadPurgeDate } from './leadRetention'

describe('leadPurgeDate', () => {
  it('is 12 months after the last activity', () => {
    expect(leadPurgeDate({ status: 'nou', last_activity_at: '2026-11-18T09:30:00Z' })?.toISOString()).toBe('2027-11-18T09:30:00.000Z')
  })

  it('counts from the last activity, not the creation', () => {
    expect(leadPurgeDate({ status: 'in_discutie', last_activity_at: '2027-03-02T00:00:00Z' })?.toISOString()).toBe('2028-03-02T00:00:00.000Z')
  })

  it('applies to refused leads too', () => {
    expect(leadPurgeDate({ status: 'refuzat', last_activity_at: '2026-01-10T00:00:00Z' })).not.toBeNull()
  })

  it('never deletes a won lead', () => {
    expect(leadPurgeDate({ status: 'castigat', last_activity_at: '2020-01-01T00:00:00Z' })).toBeNull()
  })

  it('has no date when the timestamp is unreadable', () => {
    expect(leadPurgeDate({ status: 'nou', last_activity_at: 'not a date' })).toBeNull()
  })
})
