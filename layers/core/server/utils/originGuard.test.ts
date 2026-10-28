import { describe, expect, it } from 'vitest'
import { isTrustedOrigin } from './originGuard'

describe('isTrustedOrigin', () => {
  it('is off when no secret is configured', () => {
    expect(isTrustedOrigin(undefined, '')).toBe(true)
    expect(isTrustedOrigin('anything', '')).toBe(true)
  })

  it('accepts the matching header', () => {
    expect(isTrustedOrigin('s3cret', 's3cret')).toBe(true)
  })

  it('rejects a missing header', () => {
    expect(isTrustedOrigin(undefined, 's3cret')).toBe(false)
    expect(isTrustedOrigin('', 's3cret')).toBe(false)
  })

  it('rejects a wrong value of the same length', () => {
    expect(isTrustedOrigin('s3creX', 's3cret')).toBe(false)
  })

  it('rejects a value of a different length', () => {
    expect(isTrustedOrigin('s3cret-longer', 's3cret')).toBe(false)
    expect(isTrustedOrigin('s3', 's3cret')).toBe(false)
  })
})
