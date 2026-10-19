import { describe, expect, it } from 'vitest'
import { cookieDomainCandidates } from './cookieDomains'

describe('cookieDomainCandidates', () => {
  it('has no variants for localhost', () => {
    expect(cookieDomainCandidates('localhost')).toEqual([])
  })

  it('returns the registrable domain for an apex host', () => {
    expect(cookieDomainCandidates('codepedia.md')).toEqual(['.codepedia.md'])
  })

  it('returns the host and each parent for a subdomain', () => {
    expect(cookieDomainCandidates('www.codepedia.md')).toEqual(['.www.codepedia.md', '.codepedia.md'])
  })

  it('has no variants for IP addresses', () => {
    expect(cookieDomainCandidates('127.0.0.1')).toEqual([])
    expect(cookieDomainCandidates('[::1]')).toEqual([])
    expect(cookieDomainCandidates('::1')).toEqual([])
  })
})
