import type { ProjectRow } from '#layers/projects/domain/mapProject'

/** What `GET /api/admin/projects/<slug>/preview` returns: the saved row, draft or published. */
export interface ProjectPreview {
  project: ProjectRow
  published: boolean
}

/** The admin page that renders a saved project as its case study, by its RO slug. */
export function projectPreviewPath(slugRo: string): string {
  return `/admin/preview/projects/${slugRo}`
}
