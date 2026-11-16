import { describe, expect, it, vi } from 'vitest'
import { buildAdminProjectRow } from '#layers/projects/test-support/buildAdminProjectRow'
import type { PreviewProjectRow } from '#layers/projects/server/repository/projectPreviewRepository'
import { loadProjectPreview, type ProjectPreviewDependencies } from './projectPreview'

function previewRow(overrides: Partial<PreviewProjectRow> = {}): PreviewProjectRow {
  const { id: _id, nav_services: _navServices, ...row } = buildAdminProjectRow()
  return { ...row, ...overrides }
}

function deps(overrides: Partial<ProjectPreviewDependencies> = {}) {
  return {
    requireAdmin: vi.fn(async () => ({ id: 'admin-1' })),
    findBySlugRo: vi.fn(async (): Promise<PreviewProjectRow | null> => previewRow()),
    ...overrides,
  }
}

describe('loadProjectPreview', () => {
  it('reads nothing without an admin session', async () => {
    const denied = Object.assign(new Error('Unauthorized'), { statusCode: 401 })
    const d = deps({ requireAdmin: vi.fn(async () => Promise.reject(denied)) })

    await expect(loadProjectPreview(d, 'saas-logistica')).rejects.toBe(denied)
    expect(d.findBySlugRo).not.toHaveBeenCalled()
  })

  it('checks access before it looks at the slug', async () => {
    const denied = new Error('Forbidden')
    const d = deps({ requireAdmin: vi.fn(async () => Promise.reject(denied)) })

    await expect(loadProjectPreview(d, 'Not A Slug')).rejects.toBe(denied)
  })

  it('returns a draft, marked unpublished', async () => {
    const d = deps({ findBySlugRo: vi.fn(async () => previewRow({ published_at: null })) })

    const result = await loadProjectPreview(d, 'saas-logistica')

    expect(d.findBySlugRo).toHaveBeenCalledWith('saas-logistica')
    expect(result).toMatchObject({ outcome: 'found', preview: { published: false, project: { slug_ro: 'saas-logistica' } } })
  })

  it('returns a published project, marked published, without the raw column', async () => {
    const d = deps({ findBySlugRo: vi.fn(async () => previewRow({ published_at: '2026-11-01T00:00:00Z' })) })

    const result = await loadProjectPreview(d, 'saas-logistica')

    expect(result.outcome).toBe('found')
    if (result.outcome !== 'found') return
    expect(result.preview.published).toBe(true)
    expect(result.preview.project).not.toHaveProperty('published_at')
  })

  it('is not found for an unknown slug', async () => {
    const d = deps({ findBySlugRo: vi.fn(async () => null) })

    expect(await loadProjectPreview(d, 'nu-exista')).toEqual({ outcome: 'not_found' })
  })

  it('does not query the database for a malformed slug', async () => {
    const d = deps()

    expect(await loadProjectPreview(d, '../projects')).toEqual({ outcome: 'not_found' })
    expect(d.findBySlugRo).not.toHaveBeenCalled()
  })
})
