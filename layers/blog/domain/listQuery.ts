import { isPostService, type PostService } from './frontMatter'

export type BlogListLocale = 'ro' | 'en'

export interface BlogListQuery {
  locale: BlogListLocale
  /** RO route slug of a service. */
  service?: PostService
  /** RO project slug. */
  caseSlug?: string
  limit?: number
}

export const MAX_BLOG_LIMIT = 12

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function single(value: unknown): string | undefined {
  const first = Array.isArray(value) ? value[0] : value
  return typeof first === 'string' && first !== '' ? first : undefined
}

/** Validates `GET /api/blog` query params. Returns the parsed query, or `{ error }` for a 400. */
export function parseBlogListQuery(raw: Record<string, unknown>): BlogListQuery | { error: string } {
  const query: BlogListQuery = { locale: single(raw.locale) === 'en' ? 'en' : 'ro' }

  const service = single(raw.service)
  if (service !== undefined) {
    if (!isPostService(service)) return { error: 'Unknown service' }
    query.service = service
  }

  const caseSlug = single(raw.case)
  if (caseSlug !== undefined) {
    if (!SLUG_PATTERN.test(caseSlug)) return { error: 'Invalid case' }
    query.caseSlug = caseSlug
  }

  const limit = single(raw.limit)
  if (limit !== undefined) {
    const parsed = Number(limit)
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_BLOG_LIMIT) return { error: 'Invalid limit' }
    query.limit = parsed
  }

  return query
}
