import { describe, expect, it } from 'vitest'
import { isEnPendingTranslation } from './enPendingTranslation'

describe('isEnPendingTranslation', () => {
  it('matches a listed RO path, with or without a trailing slash', () => {
    expect(isEnPendingTranslation('/preturi')).toBe(true)
    expect(isEnPendingTranslation('/preturi/')).toBe(true)
  })

  it('does not match a translated page or a sibling path', () => {
    expect(isEnPendingTranslation('/')).toBe(false)
    expect(isEnPendingTranslation('/servicii/website')).toBe(false)
  })
})
