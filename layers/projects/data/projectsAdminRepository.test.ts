import { describe, expect, it, vi } from 'vitest'
import { createFakeSupabase } from '#layers/core/test-support/fakeSupabase'
import { createProjectsAdminRepository } from './projectsAdminRepository'

type Client = Parameters<typeof createProjectsAdminRepository>[0]

function setup(copy: (url: string, prefix: string) => Promise<string | null> = async (url, prefix) => `${prefix}/${url}`) {
  const fake = createFakeSupabase()
  const media = { remove: vi.fn(async (_urls: string[]) => {}), copy: vi.fn(copy) }
  const repository = createProjectsAdminRepository(fake.client as unknown as Client, media)
  return { fake, media, repository }
}

const dbError = { message: 'boom' }

function sourceProject(overrides: Record<string, unknown> = {}) {
  return {
    id: 'p1',
    created_at: 'c',
    updated_at: 'u',
    slug_ro: 'x',
    slug_en: 'x-en',
    card_title_ro: 'Card',
    cover_path: 'cover.jpg',
    hero_path: 'hero.jpg',
    published_at: '2026-01-01',
    ...overrides,
  }
}

describe('projectsAdminRepository', () => {
  describe('save and reorder', () => {
    it('save returns the saved project, maps unique violations and rejects malformed responses', async () => {
      const { fake, repository } = setup()
      fake.script('rpc.save_project', { data: { id: 'a', slug_ro: 'b', slug_en: 'c' } })
      await expect(repository.save({})).resolves.toEqual({ id: 'a', slug_ro: 'b', slug_en: 'c' })
      fake.script('rpc.save_project', { data: { id: 'a' } })
      await expect(repository.save({})).rejects.toMatchObject({ code: 'unexpected' })
      fake.script('rpc.save_project', { data: [] })
      await expect(repository.save({})).rejects.toMatchObject({ code: 'unexpected' })
      fake.script('rpc.save_project', { error: { message: 'dup', code: '23505' } })
      await expect(repository.save({})).rejects.toMatchObject({ message: expect.stringContaining('Slug-ul există deja') })
      for (const code of ['42501', 'PGRST301']) {
        fake.script('rpc.save_project', { error: { message: 'Not authorised to edit projects', code } })
        await expect(repository.save({})).rejects.toMatchObject({ message: expect.stringContaining('Sesiunea a expirat') })
      }
    })

    it('reorder sends the slugs in one rpc and throws on error', async () => {
      const { fake, repository } = setup()
      await repository.reorder(['a', 'b'])
      expect(fake.chainOf('rpc.reorder_projects')).toEqual([['rpc', [{ slugs: ['a', 'b'] }]]])
      fake.script('rpc.reorder_projects', { error: dbError })
      await expect(repository.reorder(['a'])).rejects.toMatchObject({ message: 'Ordinea nu s-a salvat.' })
    })
  })

  describe('getBySlug', () => {
    it('orders every child list by sort_order, since a save writes their array order back', async () => {
      const { fake, repository } = setup()
      fake.script('projects.select', { data: null })
      await repository.getBySlug('x')
      const orders = fake.chainOf('projects.select').filter(([method]) => method === 'order')
      expect(orders.map(([, args]) => args)).toEqual(
        ['project_facts', 'project_stack', 'project_stats', 'project_images'].map((table) => ['sort_order', { foreignTable: table }]),
      )
    })
  })

  describe('setFeatured', () => {
    it('updates the flag by slug', async () => {
      const { fake, repository } = setup()
      fake.script('projects.update', { data: [{ slug_ro: 'x' }] })
      await repository.setFeatured('x', true)
      expect(fake.chainOf('projects.update')).toContainEqual(['update', [{ featured: true }]])
      expect(fake.chainOf('projects.update')).toContainEqual(['eq', ['slug_ro', 'x']])
    })

    it('throws on error and when no row matched', async () => {
      const { fake, repository } = setup()
      fake.script('projects.update', { error: dbError })
      await expect(repository.setFeatured('x', true)).rejects.toMatchObject({ code: 'unexpected' })
      fake.script('projects.update', { data: [] })
      await expect(repository.setFeatured('x', true)).rejects.toMatchObject({ code: 'unexpected' })
    })
  })

  describe('setPublished', () => {
    const project = { slug_ro: 'x', slug_en: 'x-en' }

    it('publishing stamps published_at and touches no redirects', async () => {
      const { fake, repository } = setup()
      fake.script('projects.update', { data: [{ slug_ro: 'x' }] })
      await repository.setPublished(project, true)
      const payload = fake.chainOf('projects.update')[0]?.[1][0] as { published_at: string }
      expect(Number.isNaN(Date.parse(payload.published_at))).toBe(false)
      expect(fake.callsFor('redirects.delete')).toHaveLength(0)
    })

    it('unpublishing clears published_at and deletes the redirects to both paths', async () => {
      const { fake, repository } = setup()
      fake.script('projects.update', { data: [{ slug_ro: 'x' }] })
      await repository.setPublished(project, false)
      expect(fake.chainOf('projects.update')[0]).toEqual(['update', [{ published_at: null }]])
      expect(fake.chainOf('redirects.delete')).toContainEqual(['or', ['to_path.eq./proiecte/x,to_path.eq./en/work/x-en']])
    })

    it('falls back to the ro slug for the english path', async () => {
      const { fake, repository } = setup()
      fake.script('projects.update', { data: [{ slug_ro: 'x' }] })
      await repository.setPublished({ slug_ro: 'x', slug_en: null }, false)
      expect(fake.chainOf('redirects.delete')).toContainEqual(['or', ['to_path.eq./proiecte/x,to_path.eq./en/work/x']])
    })

    it('throws on error or zero rows, with a message per direction, before touching redirects', async () => {
      const { fake, repository } = setup()
      fake.script('projects.update', { error: dbError })
      await expect(repository.setPublished(project, true)).rejects.toMatchObject({ message: 'Proiectul nu a putut fi publicat.' })
      fake.script('projects.update', { data: [] })
      await expect(repository.setPublished(project, false)).rejects.toMatchObject({ message: 'Proiectul nu a putut fi retras.' })
      expect(fake.callsFor('redirects.delete')).toHaveLength(0)
    })

    it('reports a partial failure when the redirect cleanup fails after unpublishing', async () => {
      const { fake, repository } = setup()
      fake.script('projects.update', { data: [{ slug_ro: 'x' }] })
      fake.script('redirects.delete', { error: dbError })
      await expect(repository.setPublished(project, false)).rejects.toMatchObject({
        message: 'Proiectul a fost retras, dar redirect-urile nu au putut fi șterse.',
      })
    })
  })

  describe('remove', () => {
    const found = {
      slug_ro: 'x',
      slug_en: null,
      cover_path: 'cover.jpg',
      hero_path: null,
      project_images: [{ path: 'g1.jpg' }],
    }

    it('does nothing when the project does not exist', async () => {
      const { fake, media, repository } = setup()
      await repository.remove('x')
      expect(fake.callsFor('projects.delete')).toHaveLength(0)
      expect(media.remove).not.toHaveBeenCalled()
    })

    it('refuses to delete when the preliminary read fails', async () => {
      const { fake, media, repository } = setup()
      fake.script('projects.select', { error: dbError })
      await expect(repository.remove('x')).rejects.toMatchObject({ code: 'unexpected' })
      expect(fake.callsFor('projects.delete')).toHaveLength(0)
      expect(media.remove).not.toHaveBeenCalled()
    })

    it('keeps the media when the delete itself fails', async () => {
      const { fake, media, repository } = setup()
      fake.script('projects.select', { data: found })
      fake.script('projects.delete', { error: dbError })
      await expect(repository.remove('x')).rejects.toMatchObject({ message: 'Proiectul nu a putut fi șters.' })
      expect(fake.callsFor('redirects.delete')).toHaveLength(0)
      expect(media.remove).not.toHaveBeenCalled()
    })

    it('deletes redirects and every unreferenced file (cover and gallery)', async () => {
      const { fake, media, repository } = setup()
      fake.script('projects.select', { data: found }, { count: 0 })
      fake.script('project_images.select', { count: 0 })
      await repository.remove('x')
      expect(fake.chainOf('redirects.delete')).toContainEqual(['or', ['to_path.eq./proiecte/x,to_path.eq./en/work/x']])
      expect(media.remove).toHaveBeenCalledWith(['cover.jpg', 'g1.jpg'])
    })

    it('keeps files that another project still references', async () => {
      const { fake, media, repository } = setup()
      fake.script('projects.select', { data: found }, { count: 1 })
      fake.script('project_images.select', { count: 0 })
      await repository.remove('x')
      expect(media.remove).not.toHaveBeenCalled()
    })

    it('keeps a file when the reference check fails', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { fake, media, repository } = setup()
      fake.script('projects.select', { data: found }, { error: dbError })
      fake.script('project_images.select', { count: 0 })
      await repository.remove('x')
      expect(media.remove).not.toHaveBeenCalled()
      warn.mockRestore()
    })

    it('reports a partial failure when redirects cannot be deleted, and leaves the media alone', async () => {
      const { fake, media, repository } = setup()
      fake.script('projects.select', { data: found })
      fake.script('redirects.delete', { error: dbError })
      await expect(repository.remove('x')).rejects.toMatchObject({
        message: 'Proiectul a fost șters, dar redirect-urile nu au putut fi șterse.',
      })
      expect(media.remove).not.toHaveBeenCalled()
    })
  })

  describe('duplicate', () => {
    function scriptHappy(fake: ReturnType<typeof setup>['fake'], project = sourceProject()) {
      fake.script('projects.select', { data: project }, { data: [{ slug_ro: 'other', slug_en: null }] })
      fake.script('projects.insert', { data: { id: 'p2' } })
      fake.script('project_facts.select', { data: [{ id: 'f1', project_id: 'p1', label: 'a' }] })
    }

    it('copies the row with a free slug, a copy title and no publication, plus its children', async () => {
      const { fake, media, repository } = setup()
      scriptHappy(fake)
      fake.script('project_images.select', { data: [{ id: 'i1', project_id: 'p1', path: 'g.jpg' }] })
      await expect(repository.duplicate('x')).resolves.toBe(true)
      const insert = fake.chainOf('projects.insert')[0]?.[1][0] as Record<string, unknown>
      expect(insert).toMatchObject({
        slug_ro: 'x-copie',
        slug_en: 'x-copie',
        card_title_ro: 'Card (copie)',
        published_at: null,
        cover_path: 'x-copie/cover/cover.jpg',
        hero_path: 'x-copie/hero/hero.jpg',
      })
      expect(insert).not.toHaveProperty('id')
      expect(fake.chainOf('project_facts.insert')[0]?.[1][0]).toEqual([{ label: 'a', project_id: 'p2' }])
      expect(fake.chainOf('project_images.insert')[0]?.[1][0]).toEqual([{ project_id: 'p2', path: 'x-copie/gallery/g.jpg' }])
      expect(media.copy).toHaveBeenCalledTimes(3)
      expect(fake.callsFor('project_steps.insert')).toHaveLength(0)
    })

    it('skips slugs that are already taken', async () => {
      const { fake, repository } = setup()
      scriptHappy(fake)
      fake.script('projects.select', { data: sourceProject() }, { data: [{ slug_ro: 'x-copie', slug_en: 'x-copie-2' }] })
      await repository.duplicate('x')
      expect(fake.chainOf('projects.insert')[0]?.[1][0]).toMatchObject({ slug_ro: 'x-copie-3' })
    })

    it('throws when the source cannot be loaded or the slugs cannot be read', async () => {
      const { fake, media, repository } = setup()
      fake.script('projects.select', { error: dbError })
      await expect(repository.duplicate('x')).rejects.toMatchObject({ message: 'Proiectul nu a putut fi încărcat.' })
      fake.script('projects.select', { data: sourceProject() }, { error: dbError })
      await expect(repository.duplicate('x')).rejects.toMatchObject({ message: 'Proiectul nu a putut fi duplicat.' })
      expect(fake.callsFor('projects.insert')).toHaveLength(0)
      expect(media.copy).not.toHaveBeenCalled()
    })

    it('resolves false and drops the path when a cover or hero copy fails', async () => {
      const { fake, repository } = setup(async () => null)
      scriptHappy(fake)
      await expect(repository.duplicate('x')).resolves.toBe(false)
      expect(fake.chainOf('projects.insert')[0]?.[1][0]).toMatchObject({ cover_path: null, hero_path: null })
    })

    it('copies a project without media as complete', async () => {
      const { fake, media, repository } = setup()
      scriptHappy(fake, sourceProject({ cover_path: null, hero_path: null }))
      await expect(repository.duplicate('x')).resolves.toBe(true)
      expect(media.copy).not.toHaveBeenCalled()
    })

    it('keeps the original gallery path and resolves false when a gallery copy fails', async () => {
      const { fake, repository } = setup(async (url) => (url === 'g.jpg' ? null : `copy/${url}`))
      scriptHappy(fake)
      fake.script('project_images.select', { data: [{ id: 'i1', project_id: 'p1', path: 'g.jpg' }] })
      await expect(repository.duplicate('x')).resolves.toBe(false)
      expect(fake.chainOf('project_images.insert')[0]?.[1][0]).toEqual([{ project_id: 'p2', path: 'g.jpg' }])
    })

    it('throws when the project insert fails and copies no children', async () => {
      const { fake, repository } = setup()
      scriptHappy(fake)
      fake.script('projects.insert', { error: dbError })
      await expect(repository.duplicate('x')).rejects.toMatchObject({ message: 'Proiectul nu a putut fi duplicat.' })
      expect(fake.callsFor('project_facts.select')).toHaveLength(0)
    })

    it('removes the already-copied media when the project insert fails', async () => {
      const { fake, media, repository } = setup()
      scriptHappy(fake)
      fake.script('projects.insert', { error: dbError })
      await expect(repository.duplicate('x')).rejects.toMatchObject({ message: 'Proiectul nu a putut fi duplicat.' })
      const copies = await Promise.all(media.copy.mock.results.map((result) => result.value as Promise<string | null>))
      expect(copies.length).toBeGreaterThan(0)
      expect(media.remove).toHaveBeenCalledWith(copies.filter(Boolean))
    })

    it('resolves false when a child table cannot be read', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { fake, repository } = setup()
      scriptHappy(fake)
      fake.script('project_steps.select', { error: dbError })
      await expect(repository.duplicate('x')).resolves.toBe(false)
      warn.mockRestore()
    })

    it('resolves false when child rows cannot be inserted', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { fake, repository } = setup()
      scriptHappy(fake)
      fake.script('project_facts.insert', { error: dbError })
      await expect(repository.duplicate('x')).resolves.toBe(false)
      warn.mockRestore()
    })
  })
})
