import { describe, expect, it } from 'vitest'
import { buildGaInitSequence } from './gaInit'

describe('buildGaInitSequence', () => {
  it('pushes consent default before js and config', () => {
    const now = new Date('2026-09-27T00:00:00Z')
    const sequence = buildGaInitSequence('G-TEST', true, false, now)
    expect(sequence).toEqual([
      [
        'consent',
        'default',
        { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' },
      ],
      ['js', now],
      ['config', 'G-TEST'],
    ])
  })

  it('grants ad_* signals in the default call when marketing consent is already granted', () => {
    const now = new Date('2026-09-27T00:00:00Z')
    const [defaultCall] = buildGaInitSequence('G-TEST', true, true, now)
    expect(defaultCall).toEqual([
      'consent',
      'default',
      { analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' },
    ])
  })
})
