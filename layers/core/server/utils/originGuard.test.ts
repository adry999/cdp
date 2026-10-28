import { describe, expect, it } from 'vitest'
import { isInternalRequest, isTrustedOrigin } from './originGuard'

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

describe('isInternalRequest', () => {
  it('treats an empty remote address as an in-process request', () => {
    expect(isInternalRequest('')).toBe(true)
    expect(isInternalRequest(undefined)).toBe(true)
  })

  it('treats a real connection as external', () => {
    expect(isInternalRequest('203.0.113.7')).toBe(false)
    expect(isInternalRequest('::1')).toBe(false)
    expect(isInternalRequest('::ffff:127.0.0.1')).toBe(false)
  })
})
