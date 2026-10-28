import { describe, expect, it } from 'vitest'
import { checkBodySize } from './assertBodySize'

describe('checkBodySize', () => {
  it('accepts a body within the cap, including exactly the cap', () => {
    expect(checkBodySize('120', 1000)).toBe('ok')
    expect(checkBodySize('1000', 1000)).toBe('ok')
  })

  it('rejects a body over the cap', () => {
    expect(checkBodySize('1001', 1000)).toBe('too_large')
  })

  it('lets through a body without a usable Content-Length (chunked via a proxy)', () => {
    expect(checkBodySize(undefined, 1000)).toBe('ok')
    expect(checkBodySize('', 1000)).toBe('ok')
    expect(checkBodySize('abc', 1000)).toBe('ok')
  })
})
