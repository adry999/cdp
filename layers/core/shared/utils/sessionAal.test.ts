import { describe, expect, it } from 'vitest'
import { sessionAal } from './sessionAal'

function token(payload: unknown): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `header.${body}.signature`
}

describe('sessionAal', () => {
  it('reads aal1', () => expect(sessionAal(token({ sub: 'u1', aal: 'aal1' }))).toBe('aal1'))
  it('reads aal2', () => expect(sessionAal(token({ sub: 'u1', aal: 'aal2' }))).toBe('aal2'))
  it('decodes base64url payloads with non-ASCII characters', () =>
    expect(sessionAal(token({ name: 'Ștefan ăîâ', aal: 'aal2' }))).toBe('aal2'))
  it('is null when the claim is missing or unknown', () => {
    expect(sessionAal(token({ sub: 'u1' }))).toBeNull()
    expect(sessionAal(token({ aal: 'aal9' }))).toBeNull()
  })
  it('is null for malformed tokens', () => {
    expect(sessionAal('garbage')).toBeNull()
    expect(sessionAal('a.%%%.c')).toBeNull()
    expect(sessionAal(`a.${Buffer.from('not json').toString('base64url')}.c`)).toBeNull()
  })
  it('is null without a token', () => {
    expect(sessionAal(undefined)).toBeNull()
    expect(sessionAal('')).toBeNull()
  })
})
