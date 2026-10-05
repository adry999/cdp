import { describe, expect, it } from 'vitest'
import { caseStudyPaths } from './caseStudyPaths'

describe('caseStudyPaths', () => {
  it('builds one path per locale from the two slugs', () => {
    expect(caseStudyPaths('saas-logistica', 'logistics-saas')).toEqual({
      ro: '/proiecte/saas-logistica',
      en: '/en/work/logistics-saas',
    })
  })

  it('reuses the RO slug for EN when there is no EN slug', () => {
    expect(caseStudyPaths('saas-logistica', null).en).toBe('/en/work/saas-logistica')
  })
})
