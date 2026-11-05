import { describe, expect, it } from 'vitest'
import { createFakeSupabase } from '#layers/core/test-support/fakeSupabase'
import { newsRedirectTargets } from '#layers/news/domain/newsRedirects'
import type { NewsInsert } from '#layers/news/domain/newsForm'
import { createNewsAdminRepository } from './newsAdminRepository'

function setup() {
  const fake = createFakeSupabase()
  const repository = createNewsAdminRepository(fake.client as unknown as Parameters<typeof createNewsAdminRepository>[0])
  return { fake, repository }
}

const row = { slug_ro: 'a' } as unknown as NewsInsert
const uuid = '123e4567-e89b-12d3-a456-426614174000'

describe('newsAdminRepository', () => {
  it('get filters by id for a uuid and by slug_ro otherwise', async () => {
    const { fake, repository } = setup()
    await repository.get(uuid)
    await repository.get('un-slug')
    const [byId, bySlug] = fake.callsFor('news_items.select')
    expect(byId?.chain).toContainEqual(['eq', ['id', uuid]])
    expect(bySlug?.chain).toContainEqual(['eq', ['slug_ro', 'un-slug']])
  })

  it('get throws on error', async () => {
    const { fake, repository } = setup()
    fake.script('news_items.select', { error: { message: 'x' } })
    await expect(repository.get('s')).rejects.toMatchObject({ code: 'unexpected' })
  })

  it('create maps a unique violation to the slug message', async () => {
    const { fake, repository } = setup()
    fake.script('news_items.insert', { error: { message: 'dup', code: '23505' } })
    await expect(repository.create(row)).rejects.toMatchObject({ message: expect.stringContaining('Slug-ul există deja') })
  })

  it('create surfaces other errors with their own message', async () => {
    const { fake, repository } = setup()
    fake.script('news_items.insert', { error: { message: 'other' } })
    await expect(repository.create(row)).rejects.toMatchObject({ message: 'other' })
  })

  it('update returns the saved row and throws when RLS matches nothing', async () => {
    const { fake, repository } = setup()
    fake.script('news_items.update', { data: { id: 'n1', slug_ro: 'a' } })
    await expect(repository.update('n1', row)).resolves.toEqual({ id: 'n1', slug_ro: 'a' })
    fake.script('news_items.update', { data: null })
    await expect(repository.update('n1', row)).rejects.toMatchObject({ code: 'unexpected' })
    fake.script('news_items.update', { error: { message: 'dup', code: '23505' } })
    await expect(repository.update('n1', row)).rejects.toMatchObject({ message: expect.stringContaining('Slug-ul') })
  })

  describe('remove', () => {
    const item = { slug_ro: 'a', slug_en: 'b' }

    it('deletes the row, then the redirects pointing at its slugs', async () => {
      const { fake, repository } = setup()
      fake.script('news_items.select', { data: item })
      fake.script('news_items.delete', { count: 1 })
      await repository.remove('n1')
      expect(fake.chainOf('redirects.delete')).toContainEqual(['in', ['to_path', newsRedirectTargets(item)]])
    })

    it('fails without deleting when the row cannot be read or does not exist', async () => {
      const { fake, repository } = setup()
      fake.script('news_items.select', { error: { message: 'x' } })
      await expect(repository.remove('n1')).rejects.toMatchObject({ code: 'unexpected' })
      fake.script('news_items.select', { data: null })
      await expect(repository.remove('n1')).rejects.toMatchObject({ code: 'unexpected' })
      expect(fake.callsFor('news_items.delete')).toHaveLength(0)
    })

    it('fails and keeps the redirects when the delete affects no row or errors', async () => {
      const { fake, repository } = setup()
      fake.script('news_items.select', { data: item })
      fake.script('news_items.delete', { count: 0 })
      await expect(repository.remove('n1')).rejects.toMatchObject({ code: 'unexpected' })
      fake.script('news_items.delete', { error: { message: 'x' } })
      await expect(repository.remove('n1')).rejects.toMatchObject({ code: 'unexpected' })
      expect(fake.callsFor('redirects.delete')).toHaveLength(0)
    })

    it('reports a partial failure when the redirect cleanup fails after the delete', async () => {
      const { fake, repository } = setup()
      fake.script('news_items.select', { data: item })
      fake.script('news_items.delete', { count: 1 })
      fake.script('redirects.delete', { error: { message: 'x' } })
      await expect(repository.remove('n1')).rejects.toMatchObject({
        message: 'Noutatea a fost ștearsă, dar redirect-urile nu au putut fi șterse.',
      })
    })
  })
})
