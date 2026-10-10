import { describe, expect, it } from 'vitest'
import { listNavProjects } from './listNavProjects'
import type { NavProjectRow } from '#layers/projects/domain/projectSelect'

const row = (slug: string, nav_services: string[]): NavProjectRow => ({
  slug_ro: slug,
  slug_en: null,
  card_title_ro: slug,
  card_title_en: null,
  kind_ro: null,
  kind_en: null,
  cover_path: null,
  cover_alt_ro: null,
  cover_alt_en: null,
  nav_services,
  featured: false,
  sort_order: 0,
})

describe('listNavProjects', () => {
  it('applies the per-service selection to what the repository returns', async () => {
    const rows = [row('a', ['website']), row('b', []), row('c', ['web-app', 'wordpress'])]
    const result = await listNavProjects({ listPublishedNavRows: async () => rows })
    expect(result.map((r) => r.slug_ro)).toEqual(['a', 'c'])
  })

  it('propagates repository failures', async () => {
    await expect(listNavProjects({ listPublishedNavRows: () => Promise.reject(new Error('db down')) })).rejects.toThrow('db down')
  })
})
