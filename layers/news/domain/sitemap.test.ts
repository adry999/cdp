import { describe, expect, it } from 'vitest'
import { toLastmod } from '#layers/core/server/utils/sitemap'
import { NEWS_INDEX_PAGE, newsSitemapPages } from './sitemap'

const row = { slug_ro: 'a', slug_en: 'a-en', title_en: 'T', summary_en: 'S', updated_at: '2026-10-02T09:00:00.000Z' }

describe('newsSitemapPages', () => {
  it('is empty without items', () => {
    expect(newsSitemapPages([], toLastmod)).toEqual([])
  })

  it('lists the index and each item with RO/EN paths and lastmod', () => {
    const pages = newsSitemapPages([row], toLastmod)
    expect(pages[0]).toEqual(NEWS_INDEX_PAGE)
    expect(pages[1]).toMatchObject({ ro: '/noutati/a', en: '/en/news/a-en', lastmod: '2026-10-02' })
    expect(pages[1]?.enPending).toBeUndefined()
  })

  it('marks an untranslated item as EN-pending', () => {
    const [, page] = newsSitemapPages([{ ...row, title_en: null }], toLastmod)
    expect(page?.enPending).toBe(true)
  })
})
