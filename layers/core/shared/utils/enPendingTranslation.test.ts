import { describe, expect, it } from 'vitest'
import { isEnPendingPath } from './enPendingTranslation'

const pending = ['/preturi', '/despre']

describe('isEnPendingPath', () => {
  it('matches a listed RO path, with or without a trailing slash', () => {
    expect(isEnPendingPath(pending, '/preturi')).toBe(true)
    expect(isEnPendingPath(pending, '/preturi/')).toBe(true)
  })

  it('does not match a translated page or a sibling path', () => {
    expect(isEnPendingPath(pending, '/')).toBe(false)
    expect(isEnPendingPath(pending, '/preturi/extra')).toBe(false)
  })
})
