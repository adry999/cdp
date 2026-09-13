import { describe, expect, it } from 'vitest'
import { EMAIL_PATTERN, clipText } from './text'

describe('clipText', () => {
  it('trims surrounding whitespace', () => {
    expect(clipText('  Ana Pop  ', 200)).toBe('Ana Pop')
  })

  it('cuts the trimmed value to the maximum length', () => {
    expect(clipText('  abcdef', 3)).toBe('abc')
  })

  it('returns an empty string for a missing value', () => {
    expect(clipText(undefined, 10)).toBe('')
  })
})

describe('EMAIL_PATTERN', () => {
  it('accepts a regular address', () => {
    expect(EMAIL_PATTERN.test('ana@example.com')).toBe(true)
  })

  it.each(['ana', 'ana@', '@example.com', 'ana@example', 'ana @example.com'])('rejects %s', (address) => {
    expect(EMAIL_PATTERN.test(address)).toBe(false)
  })
})
