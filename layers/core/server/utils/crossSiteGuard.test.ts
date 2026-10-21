import { describe, expect, it } from 'vitest'
import { isCrossSiteAdminWrite } from './crossSiteGuard'

describe('isCrossSiteAdminWrite', () => {
  it('rejects a cross-site POST to an admin API', () => {
    expect(isCrossSiteAdminWrite('POST', '/api/admin/news/preview', 'cross-site')).toBe(true)
    expect(isCrossSiteAdminWrite('delete', '/api/admin/projects/1', 'cross-site')).toBe(true)
  })

  it('allows same-origin, same-site and direct navigations', () => {
    for (const site of ['same-origin', 'same-site', 'none']) {
      expect(isCrossSiteAdminWrite('POST', '/api/admin/news/preview', site)).toBe(false)
    }
  })

  it('allows requests without the header', () => {
    expect(isCrossSiteAdminWrite('POST', '/api/admin/news/preview', undefined)).toBe(false)
  })

  it('allows safe methods', () => {
    for (const method of ['GET', 'HEAD', 'OPTIONS']) {
      expect(isCrossSiteAdminWrite(method, '/api/admin/leads', 'cross-site')).toBe(false)
    }
  })

  it('ignores paths outside /api/admin/', () => {
    expect(isCrossSiteAdminWrite('POST', '/api/leads', 'cross-site')).toBe(false)
  })
})
