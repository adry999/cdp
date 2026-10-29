import { describe, expect, it } from 'vitest'
import { MIN_ADMIN_PASSWORD_LENGTH, passwordMessage, passwordProblem } from './adminPassword'

describe('passwordProblem', () => {
  const long = 'x'.repeat(MIN_ADMIN_PASSWORD_LENGTH)

  it('rejects a short password before comparing', () => {
    expect(passwordProblem('short', 'other')).toBe('too_short')
  })

  it('rejects a confirmation that differs', () => {
    expect(passwordProblem(long, `${long}y`)).toBe('mismatch')
  })

  it('accepts a long enough, confirmed password', () => {
    expect(passwordProblem(long, long)).toBeNull()
  })
})

describe('passwordMessage', () => {
  it('names the minimum length', () => {
    expect(passwordMessage('too_short')).toContain(String(MIN_ADMIN_PASSWORD_LENGTH))
  })

  it('maps Supabase Auth codes and falls back for unknown ones', () => {
    expect(passwordMessage('same_password')).toContain('difere')
    expect(passwordMessage('weak_password')).toContain('slabă')
    expect(passwordMessage('unexpected_failure')).toBe('Nu am putut schimba parola.')
    expect(passwordMessage(undefined)).toBe('Nu am putut schimba parola.')
  })
})
