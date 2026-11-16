import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import type { AdminProjectListRow } from '#layers/projects/domain/projectSelect'
import { createProjectsAdminActions, type ProjectsAdminActionsDeps } from '#layers/projects/state/projectsAdminActions'
import { buildAdminListRow } from '#layers/projects/test-support/buildAdminListRow'

const live = buildAdminListRow({ slug_ro: 'live', card_title_ro: 'Live', published_at: '2026-10-01T00:00:00Z' })
const draft = buildAdminListRow({ slug_ro: 'draft', card_title_ro: 'Draft', featured: false })

function setup(overrides: Partial<ProjectsAdminActionsDeps['repository']> = {}) {
  const calls: string[] = []
  const repository: ProjectsAdminActionsDeps['repository'] = {
    remove: async (slug) => {
      calls.push(`remove ${slug}`)
    },
    duplicate: async (slug) => {
      calls.push(`duplicate ${slug}`)
      return true
    },
    setPublished: async (project, published) => {
      calls.push(`setPublished ${project.slug_ro} ${published}`)
    },
    setFeatured: async (slug, featured) => {
      calls.push(`setFeatured ${slug} ${featured}`)
    },
    ...overrides,
  }
  const sync = vi.fn(async () => {})
  const projects = ref<AdminProjectListRow[]>([live, draft])
  return { calls, sync, actions: createProjectsAdminActions({ projects, repository, sync }) }
}

const failing = async () => {
  throw new Error('nope')
}

describe('createProjectsAdminActions', () => {
  it('only asks before unpublishing; nothing is written until confirmed', () => {
    const { actions, calls, sync } = setup()
    actions.askUnpublish('live')
    expect(actions.unpublishingProject.value?.card_title_ro).toBe('Live')
    expect(calls).toEqual([])
    expect(sync).not.toHaveBeenCalled()
  })

  it('unpublishes the confirmed project, closes the dialog and syncs the list', async () => {
    const { actions, calls, sync } = setup()
    actions.askUnpublish('live')
    await actions.confirmUnpublish()
    expect(calls).toEqual(['setPublished live false'])
    expect(actions.unpublishing.value).toBeNull()
    expect(sync).toHaveBeenCalledOnce()
  })

  it('keeps the unpublish dialog open on failure, with a notice for that row', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { actions } = setup({ setPublished: failing })
    actions.askUnpublish('live')
    await actions.confirmUnpublish()
    expect(actions.unpublishing.value).toBe('live')
    expect(actions.notice.value).toEqual({ tone: 'error', text: 'Proiectul nu a putut fi retras.', slug: 'live' })
  })

  it('toggles the homepage flag to the opposite of the stored value', async () => {
    const { actions, calls } = setup()
    await actions.toggleFeatured('draft')
    expect(calls).toEqual(['setFeatured draft true'])
  })

  it('ties a failed row action to its row', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { actions } = setup({ setFeatured: failing })
    await actions.toggleFeatured('draft')
    expect(actions.notice.value?.slug).toBe('draft')
    expect(actions.busy.value).toBeNull()
  })

  it('reports a partial duplicate on the row it was copied from', async () => {
    const { actions } = setup({ duplicate: async () => false })
    await actions.duplicate('live')
    expect(actions.notice.value).toMatchObject({ tone: 'error', slug: 'live' })
  })

  it('opens a dialog without an older action\'s notice', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { actions } = setup({ setFeatured: failing })
    await actions.toggleFeatured('live')
    actions.askUnpublish('live')
    expect(actions.notice.value).toBeNull()
  })

  it('clears the previous notice when another action starts', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { actions } = setup({ setFeatured: failing })
    await actions.toggleFeatured('draft')
    await actions.duplicate('live')
    expect(actions.notice.value).toBeNull()
  })
})
