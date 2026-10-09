import { describe, expect, it } from 'vitest'
import { parseBlogListQuery } from './listQuery'

describe('parseBlogListQuery', () => {
  it('defaults to RO with no filters', () => {
    expect(parseBlogListQuery({})).toEqual({ locale: 'ro' })
  })

  it('reads locale, service, case and limit', () => {
    expect(parseBlogListQuery({ locale: 'en', service: 'aplicatie-web', case: 'bloom', limit: '3' })).toEqual({
      locale: 'en',
      service: 'aplicatie-web',
      caseSlug: 'bloom',
      limit: 3,
    })
  })

  it('rejects an unknown service', () => {
    expect(parseBlogListQuery({ service: 'web-app' })).toEqual({ error: 'Unknown service' })
  })

  it('rejects a malformed case', () => {
    expect(parseBlogListQuery({ case: 'Bloom/../x' })).toEqual({ error: 'Invalid case' })
  })

  it.each(['0', '-1', '1.5', 'abc', '13'])('rejects limit %s', (limit) => {
    expect(parseBlogListQuery({ limit })).toEqual({ error: 'Invalid limit' })
  })
})
