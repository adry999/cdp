/** The answer of `GET /api/news/count`. */
export interface NewsCount {
  count: number
}

/**
 * Whether the site links to /noutati: only while at least one item is published, since the empty
 * index is a dead end. A failed or malformed answer hides the link too.
 */
export function showsNewsLink(answer: unknown): boolean {
  if (typeof answer !== 'object' || answer === null) return false
  const count = (answer as { count?: unknown }).count
  return typeof count === 'number' && Number.isFinite(count) && count > 0
}
