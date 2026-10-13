import { describe, expect, it } from 'vitest'
import { EMAIL_PATTERN, clipText, withArrow } from './text'

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

  it.each([123, null, true, ['a'], { text: 'a' }])('returns an empty string for the non-text value %j', (value) => {
    expect(clipText(value, 10)).toBe('')
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

describe('withArrow', () => {
  it('ties the arrow to the last word with a no-break space', () => {
    expect(withArrow('Aplicație web (uz intern)')).toBe('Aplicație web (uz intern)\u00a0→')
  })

  it('drops trailing whitespace before the arrow', () => {
    expect(withArrow('Portal ')).toBe('Portal\u00a0→')
  })
})
