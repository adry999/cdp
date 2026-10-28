import { describe, expect, it } from 'vitest'
import { LOCALE_ENTRY_VARY, isLocaleEntryPath, localeEntryHeaders } from './localeEntryHeaders'

describe('localeEntryHeaders', () => {
  it('keeps the entry pages out of shared caches and varies them on the redirect signals', () => {
    for (const pathname of ['/', '/en']) {
      expect(localeEntryHeaders(pathname, 200)).toEqual({ 'Cache-Control': 'private, no-cache', Vary: LOCALE_ENTRY_VARY })
    }
  })

  it('leaves redirects and errors to the middleware and the error handler', () => {
    expect(localeEntryHeaders('/', 302)).toBeUndefined()
    expect(localeEntryHeaders('/en', 404)).toBeUndefined()
  })

  it('recognises only the two entry paths', () => {
    expect(isLocaleEntryPath('/')).toBe(true)
    expect(isLocaleEntryPath('/en')).toBe(true)
    expect(isLocaleEntryPath('/en/')).toBe(false)
  })

  it('ignores every other path', () => {
    expect(localeEntryHeaders('/despre', 200)).toBeUndefined()
    expect(localeEntryHeaders('/en/about', 200)).toBeUndefined()
  })
})
