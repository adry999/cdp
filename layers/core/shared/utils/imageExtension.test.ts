import { describe, expect, it } from 'vitest'
import { imageExtension } from '#layers/core/shared/utils/imageExtension'

describe('imageExtension', () => {
  it.each([
    ['image/jpeg', 'jpg'],
    ['image/png', 'png'],
    ['image/webp', 'webp'],
    ['image/svg+xml', 'svg'],
    ['image/avif', 'avif'],
    ['image/gif', 'gif'],
  ])('maps %s to %s', (type, ext) => {
    expect(imageExtension(type)).toBe(ext)
  })

  it('rejects types it does not know', () => {
    expect(imageExtension('application/pdf')).toBeNull()
    expect(imageExtension('')).toBeNull()
    expect(imageExtension('constructor')).toBeNull()
  })
})
