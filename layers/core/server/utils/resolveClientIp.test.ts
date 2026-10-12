import { describe, expect, it } from 'vitest'
import { resolveClientIp } from './resolveClientIp'

describe('resolveClientIp', () => {
  it('prefers x-vercel-forwarded-for, first value', () => {
    expect(resolveClientIp({ 'x-vercel-forwarded-for': '1.1.1.1, 2.2.2.2', 'x-real-ip': '3.3.3.3' }, () => '4.4.4.4')).toBe('1.1.1.1')
  })

  it('falls back to x-real-ip, then the generic lookup', () => {
    expect(resolveClientIp({ 'x-real-ip': '3.3.3.3' }, () => '4.4.4.4')).toBe('3.3.3.3')
    expect(resolveClientIp({}, () => '4.4.4.4')).toBe('4.4.4.4')
  })

  it('returns null when no address can be determined', () => {
    expect(resolveClientIp({ 'x-real-ip': ' ' }, () => undefined)).toBeNull()
  })
})
