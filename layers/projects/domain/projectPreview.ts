/** The admin page that renders a saved project as its case study, by its RO slug. */
export function projectPreviewPath(slugRo: string): string {
  return `/admin/preview/projects/${slugRo}`
}
