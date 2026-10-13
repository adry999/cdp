import { describe, expect, it } from 'vitest'
import { imageExtension } from '#layers/core/shared/utils/imageExtension'

describe('imageExtension', () => {
  it.each([
    ['image/jpeg', 'jpg'],
    ['image/png', 'png'],
    ['image/webp', 'webp'],
    ['image/avif', 'avif'],
  ])('maps %s to %s', (type, ext) => {
    expect(imageExtension(type)).toBe(ext)
  })

  it('rejects types it does not know', () => {
    expect(imageExtension('application/pdf')).toBeNull()
    expect(imageExtension('image/svg+xml')).toBeNull()
    expect(imageExtension('image/gif')).toBeNull()
    expect(imageExtension('')).toBeNull()
    expect(imageExtension('constructor')).toBeNull()
  })
})
