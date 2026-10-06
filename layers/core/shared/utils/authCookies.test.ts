import { describe, expect, it } from 'vitest'
import { needsAuthCookies, withoutAuthCookies } from './authCookies'

describe('needsAuthCookies', () => {
  it('keeps the session on admin pages and admin APIs', () => {
    expect(needsAuthCookies('/admin')).toBe(true)
    expect(needsAuthCookies('/admin/projects/x')).toBe(true)
    expect(needsAuthCookies('/admin?x=1')).toBe(true)
    expect(needsAuthCookies('/api/admin/revalidate')).toBe(true)
  })

  it('drops it everywhere else', () => {
    expect(needsAuthCookies('/')).toBe(false)
    expect(needsAuthCookies('/proiecte/admin-panel')).toBe(false)
    expect(needsAuthCookies('/api/projects')).toBe(false)
    expect(needsAuthCookies('/administrare')).toBe(false)
  })
})

describe('withoutAuthCookies', () => {
  it('removes only the sb-* cookies', () => {
    expect(withoutAuthCookies('sb-abc-auth-token=x; codepedia_locale=en; sb-abc-auth-token.0=y')).toBe(
      'codepedia_locale=en',
    )
  })

  it('returns undefined when nothing is left', () => {
    expect(withoutAuthCookies('sb-abc-auth-token=x')).toBeUndefined()
  })
})
