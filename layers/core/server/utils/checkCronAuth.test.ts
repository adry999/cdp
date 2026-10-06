import { describe, expect, it } from 'vitest'
import { checkCronAuth } from './checkCronAuth'

describe('checkCronAuth', () => {
  it('is disabled when no secret is configured', () => {
    expect(checkCronAuth(undefined, 'Bearer x')).toBe('disabled')
    expect(checkCronAuth('', 'Bearer ')).toBe('disabled')
  })

  it('rejects a missing or wrong header', () => {
    expect(checkCronAuth('s3cret', undefined)).toBe('unauthorized')
    expect(checkCronAuth('s3cret', 'Bearer other')).toBe('unauthorized')
    expect(checkCronAuth('s3cret', 's3cret')).toBe('unauthorized')
  })

  it('accepts the matching bearer token', () => {
    expect(checkCronAuth('s3cret', 'Bearer s3cret')).toBe('authorized')
  })
})
