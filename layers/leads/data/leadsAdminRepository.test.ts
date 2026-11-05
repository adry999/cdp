import { describe, expect, it } from 'vitest'
import { createFakeSupabase } from '#layers/core/test-support/fakeSupabase'
import { createLeadsAdminRepository } from './leadsAdminRepository'

function setup() {
  const fake = createFakeSupabase()
  const repository = createLeadsAdminRepository(fake.client as unknown as Parameters<typeof createLeadsAdminRepository>[0])
  return { fake, repository }
}

type Repository = ReturnType<typeof setup>['repository']

const dbError = { message: 'boom' }

describe('leadsAdminRepository', () => {
  it('countNew returns 0 when the count is null', async () => {
    const { repository } = setup()
    expect(await repository.countNew()).toBe(0)
  })

  it('countNew returns the count and throws on error', async () => {
    const { fake, repository } = setup()
    fake.script('leads.select', { count: 4 })
    expect(await repository.countNew()).toBe(4)
    fake.script('leads.select', { error: dbError })
    await expect(repository.countNew()).rejects.toMatchObject({ code: 'unexpected' })
  })

  it('listActive returns [] for null data and throws on error', async () => {
    const { fake, repository } = setup()
    expect(await repository.listActive()).toEqual([])
    fake.script('leads.select', { error: dbError })
    await expect(repository.listActive()).rejects.toMatchObject({ code: 'unexpected' })
  })

  it('get returns null for an unknown id and throws on error', async () => {
    const { fake, repository } = setup()
    expect(await repository.get('x')).toBeNull()
    fake.script('leads.select', { error: dbError })
    await expect(repository.get('x')).rejects.toMatchObject({ code: 'unexpected' })
  })

  it('updateStatus and updateNotes send the right payload for the id', async () => {
    const { fake, repository } = setup()
    fake.script('leads.update', { count: 1 })
    await repository.updateStatus('l1', 'in_discutie')
    await repository.updateNotes('l1', 'sunat')
    const [status, notes] = fake.callsFor('leads.update')
    expect(status?.chain).toEqual([['update', [{ status: 'in_discutie' }, { count: 'exact' }]], ['eq', ['id', 'l1']]])
    expect(notes?.chain).toEqual([['update', [{ notes: 'sunat' }, { count: 'exact' }]], ['eq', ['id', 'l1']]])
  })

  it('archive stamps archived_at and unarchive clears it', async () => {
    const { fake, repository } = setup()
    fake.script('leads.update', { count: 1 })
    await repository.archive('l1')
    await repository.unarchive('l1')
    const [archive, unarchive] = fake.callsFor('leads.update')
    const payload = archive?.chain[0]?.[1][0] as { archived_at: string }
    expect(Number.isNaN(Date.parse(payload.archived_at))).toBe(false)
    expect(unarchive?.chain[0]).toEqual(['update', [{ archived_at: null }, { count: 'exact' }]])
  })

  it.each([
    ['updateStatus', (r: Repository) => r.updateStatus('l1', 'nou')],
    ['updateNotes', (r: Repository) => r.updateNotes('l1', 'n')],
    ['archive', (r: Repository) => r.archive('l1')],
    ['unarchive', (r: Repository) => r.unarchive('l1')],
  ])('%s throws with the database message on error', async (_name, run) => {
    const { fake, repository } = setup()
    fake.script('leads.update', { error: dbError })
    await expect(run(repository)).rejects.toMatchObject({ code: 'unexpected', message: expect.stringContaining('boom') })
  })

  // Under RLS a blocked update (or an unknown id) returns no error and no row.
  it.each([
    ['updateStatus', (r: Repository) => r.updateStatus('l1', 'nou')],
    ['updateNotes', (r: Repository) => r.updateNotes('l1', 'n')],
    ['archive', (r: Repository) => r.archive('l1')],
    ['unarchive', (r: Repository) => r.unarchive('l1')],
  ])('%s throws when no row was updated', async (_name, run) => {
    const { fake, repository } = setup()
    fake.script('leads.update', { count: 0 })
    await expect(run(repository)).rejects.toMatchObject({ code: 'unexpected' })
  })

  it('remove succeeds when exactly one row is deleted', async () => {
    const { fake, repository } = setup()
    fake.script('leads.delete', { count: 1 })
    await expect(repository.remove('l1')).resolves.toBeUndefined()
  })

  it('remove throws when no row was deleted (RLS) or on error', async () => {
    const { fake, repository } = setup()
    fake.script('leads.delete', { count: 0 })
    await expect(repository.remove('l1')).rejects.toMatchObject({ code: 'unexpected' })
    fake.script('leads.delete', { error: dbError })
    await expect(repository.remove('l1')).rejects.toMatchObject({ message: expect.stringContaining('boom') })
  })
})
