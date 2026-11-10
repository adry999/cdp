import { describe, expect, it } from 'vitest'
import { socialNetworkOf } from './icons'

describe('socialNetworkOf', () => {
  it('recognises the studio profiles by host', () => {
    expect(socialNetworkOf('https://www.linkedin.com/company/codepediastudio')).toBe('linkedin')
    expect(socialNetworkOf('https://www.instagram.com/codepediastudio/')).toBe('instagram')
    expect(socialNetworkOf('https://www.facebook.com/codepediastudio')).toBe('facebook')
  })

  it('returns undefined for other hosts', () => {
    expect(socialNetworkOf('https://example.com/codepedia')).toBeUndefined()
  })
})
