import { describe, expect, it } from 'vitest'
import { SERVICE_TAG_IDS, isServiceTagId } from './service-tag'

describe('isServiceTagId', () => {
  it('accepts every known service tag', () => {
    for (const id of SERVICE_TAG_IDS) {
      expect(isServiceTagId(id)).toBe(true)
    }
  })

  it('rejects anything else', () => {
    expect(isServiceTagId('seo')).toBe(false)
    expect(isServiceTagId('')).toBe(false)
    expect(isServiceTagId(null)).toBe(false)
    expect(isServiceTagId(2)).toBe(false)
  })
})
