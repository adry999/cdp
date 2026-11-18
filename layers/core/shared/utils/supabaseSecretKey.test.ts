import { describe, expect, it } from 'vitest'
import { isSecretSupabaseKey } from './supabaseSecretKey'

// Fabricated tokens: only the payload matters, the signature is never checked here.
const jwt = (claims: object) => `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.sig`

describe('isSecretSupabaseKey', () => {
  it('flags a legacy service_role JWT', () => {
    expect(isSecretSupabaseKey(jwt({ iss: 'supabase', ref: 'abc', role: 'service_role' }))).toBe(true)
  })

  it('accepts a legacy anon JWT', () => {
    expect(isSecretSupabaseKey(jwt({ iss: 'supabase', ref: 'abc', role: 'anon' }))).toBe(false)
  })

  it('flags a new-style secret key and accepts a publishable one', () => {
    expect(isSecretSupabaseKey('sb_secret_abc123')).toBe(true)
    expect(isSecretSupabaseKey('sb_publishable_abc123')).toBe(false)
  })

  it('accepts values that are not keys at all', () => {
    expect(isSecretSupabaseKey('placeholder')).toBe(false)
    expect(isSecretSupabaseKey('a.%%%.b')).toBe(false)
  })
})
