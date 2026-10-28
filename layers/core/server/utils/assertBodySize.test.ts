import { describe, expect, it } from 'vitest'
import { BodyTooLargeError, checkBodySize, collectBodyChunks } from './assertBodySize'

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

async function* chunksOf(...parts: string[]): AsyncGenerator<Uint8Array> {
  for (const part of parts) yield Buffer.from(part)
}

describe('collectBodyChunks', () => {
  it('joins chunks within the cap, including exactly the cap', async () => {
    expect((await collectBodyChunks(chunksOf('ab', 'cd'), 4)).toString()).toBe('abcd')
  })

  it('returns an empty buffer for an empty body', async () => {
    expect((await collectBodyChunks(chunksOf(), 4)).length).toBe(0)
  })

  it('throws as soon as the total passes the cap', async () => {
    let pulled = 0
    async function* endless(): AsyncGenerator<Uint8Array> {
      while (true) {
        pulled++
        yield Buffer.from('xxxx')
      }
    }
    await expect(collectBodyChunks(endless(), 10)).rejects.toBeInstanceOf(BodyTooLargeError)
    expect(pulled).toBe(3)
  })

  it('counts bytes, not characters', async () => {
    await expect(collectBodyChunks(chunksOf('ăăă'), 5)).rejects.toBeInstanceOf(BodyTooLargeError)
  })
})
