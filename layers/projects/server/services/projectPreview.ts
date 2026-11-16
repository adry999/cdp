import { SLUG_RE } from '#layers/projects/domain/projectPayload'
import type { ProjectPreview } from '#layers/projects/domain/projectPreview'
import type { PreviewProjectRow } from '#layers/projects/server/repository/projectPreviewRepository'

export interface ProjectPreviewDependencies {
  /** Throws (401/403) unless the request carries an admin session that passed MFA. */
  requireAdmin: () => Promise<unknown>
  findBySlugRo: (slug: string) => Promise<PreviewProjectRow | null>
}

export type ProjectPreviewResult = { outcome: 'found'; preview: ProjectPreview } | { outcome: 'not_found' }

/** A saved project for the admin draft preview, draft or published. */
export async function loadProjectPreview(deps: ProjectPreviewDependencies, slug: string): Promise<ProjectPreviewResult> {
  // Access first: without it a request learns nothing, not even whether the slug exists.
  await deps.requireAdmin()
  if (!SLUG_RE.test(slug)) return { outcome: 'not_found' }
  const row = await deps.findBySlugRo(slug)
  if (!row) return { outcome: 'not_found' }
  const { published_at: publishedAt, ...project } = row
  return { outcome: 'found', preview: { project, published: publishedAt !== null } }
}
