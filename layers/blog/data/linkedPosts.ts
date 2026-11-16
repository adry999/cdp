import type { BlogPostSummary } from '#layers/blog/domain/post'

export interface LinkedPostsFilter {
  /** RO route slug of a service page. */
  service?: string
  /** RO slug of a case study. */
  caseSlug?: string
  limit?: number
}

/**
 * The `useAsyncData` key and handler for the posts tied to a service page or a case study. `BlogLinked`
 * and a page that needs to know whether that block shows (to number its sections) pass both to
 * `useAsyncData`, so they share one request and one cached payload.
 */
export function linkedPostsRequest(locale: string, filter: LinkedPostsFilter) {
  const { service, caseSlug, limit = 3 } = filter
  return {
    key: `blog-linked-${locale}-${service ?? ''}-${caseSlug ?? ''}`,
    fetch: (): Promise<BlogPostSummary[]> =>
      $fetch<BlogPostSummary[]>('/api/blog', { query: { locale, service, case: caseSlug, limit } }),
  }
}
