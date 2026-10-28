import { describe, expect, it } from 'vitest'
import { caseStudySitemapPages } from './sitemap'

const lastmod = (value: string) => value.slice(0, 10)

describe('caseStudySitemapPages', () => {
  it('lists a translated project in both locales', () => {
    expect(
      caseStudySitemapPages([{ ro: 'a', en: 'a-en', updatedAt: '2026-01-02T10:00:00Z', hasEnglish: true }], lastmod),
    ).toEqual([{ ro: '/proiecte/a', en: '/en/work/a-en', lastmod: '2026-01-02', enPending: undefined }])
  })

  it('marks a project without English copy as EN-pending', () => {
    const [page] = caseStudySitemapPages([{ ro: 'a', en: null, updatedAt: '2026-01-02', hasEnglish: false }], lastmod)
    expect(page?.enPending).toBe(true)
  })
})
