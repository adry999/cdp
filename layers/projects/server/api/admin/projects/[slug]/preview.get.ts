import { requireAdmin } from '#layers/core/server/utils/requireAdmin'
import { createProjectPreviewRepository } from '#layers/projects/server/repository/projectPreviewRepository'
import { loadProjectPreview } from '#layers/projects/server/services/projectPreview'

// Admin-only: the saved project, draft or published, for the draft preview page. The public
// GET /api/projects/<slug> keeps answering 404 for a draft. Never cached: /api/admin/** is private, no-store.
export default defineEventHandler(async (event) => {
  const repository = createProjectPreviewRepository(event)
  const result = await loadProjectPreview(
    { requireAdmin: () => requireAdmin(event), findBySlugRo: repository.findBySlugRo },
    getRouterParam(event, 'slug') ?? '',
  )
  if (result.outcome === 'not_found') throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  return result.preview
})
