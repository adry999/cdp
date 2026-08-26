import { describe, expect, it } from 'vitest'
import { resolveCaseStudySlug } from '../../shared/utils/caseStudyLink'

describe('resolveCaseStudySlug', () => {
  it('resolves the EN slug when switching to EN, not the current RO slug', () => {
    const slugs = { ro: 'studiu-caz-saas', en: 'saas-case-study' }
    expect(resolveCaseStudySlug(slugs, 'en')).toBe('saas-case-study')
  })

  it('resolves the RO slug when switching to RO', () => {
    const slugs = { ro: 'studiu-caz-saas', en: 'saas-case-study' }
    expect(resolveCaseStudySlug(slugs, 'ro')).toBe('studiu-caz-saas')
  })

  it('handles a project whose RO and EN slugs happen to be identical', () => {
    const slugs = { ro: 'saas-logistica', en: 'saas-logistica' }
    expect(resolveCaseStudySlug(slugs, 'en')).toBe('saas-logistica')
  })

  it('returns null before the page has set the slug pair, so callers fall back', () => {
    expect(resolveCaseStudySlug(null, 'en')).toBeNull()
  })
})
