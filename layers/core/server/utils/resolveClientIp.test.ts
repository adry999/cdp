import { describe, expect, it } from 'vitest'
import { resolveClientIp } from './resolveClientIp'

describe('resolveClientIp', () => {
  it('prefers cf-connecting-ip', () => {
    expect(resolveClientIp({ 'cf-connecting-ip': '1.1.1.1', 'x-real-ip': '3.3.3.3' }, () => '4.4.4.4')).toBe('1.1.1.1')
  })

  it('ignores headers a visitor can forge and falls back to the socket address', () => {
    const forged = { 'x-real-ip': '3.3.3.3', 'x-forwarded-for': '5.5.5.5', 'x-vercel-forwarded-for': '6.6.6.6' }
    expect(resolveClientIp(forged, () => '4.4.4.4')).toBe('4.4.4.4')
  })

  it('returns null when no address can be determined', () => {
    expect(resolveClientIp({ 'cf-connecting-ip': ' ' }, () => undefined)).toBeNull()
  })
})
