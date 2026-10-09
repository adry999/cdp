import { pick } from '#layers/core/shared/utils/pick'
import type { NewsRow } from '#layers/news/domain/newsSelect'

type Locale = 'ro' | 'en'

export interface NewsView {
  /** Slug for the requested locale (the English one falls back to the Romanian one). */
  slug: string
  title: string
  summary: string
  why: string | null
  sourceUrl: string
  sourceName: string
  sourceAuthor: string | null
  /** `YYYY-MM-DD`, the date the original was published. */
  sourceDate: string | null
  category: string | null
  publishedAt: string | null
  updatedAt: string
  /** False when the requested locale is English but the item has no English title or summary yet. */
  translated: boolean
}

function filled(value: string | null | undefined): string | null {
  return value && value.trim() ? value : null
}

export function newsSlug(row: Pick<NewsRow, 'slug_ro' | 'slug_en'>, locale: Locale): string {
  return locale === 'en' ? (filled(row.slug_en) ?? row.slug_ro) : row.slug_ro
}

export function mapNews(row: NewsRow, locale: Locale): NewsView {
  const hasEnglish = !!filled(row.title_en) && !!filled(row.summary_en)
  return {
    slug: newsSlug(row, locale),
    title: pick(row.title_ro, filled(row.title_en), locale),
    summary: pick(row.summary_ro, filled(row.summary_en), locale),
    why: locale === 'en' ? (filled(row.why_en) ?? filled(row.why_ro)) : filled(row.why_ro),
    sourceUrl: row.source_url,
    sourceName: row.source_name,
    sourceAuthor: filled(row.source_author),
    sourceDate: row.source_published_on,
    category: filled(row.category),
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    translated: locale === 'ro' || hasEnglish,
  }
}

/** Newest original first, then newest on our side; undated originals sink. The API already orders; this keeps the contract testable. */
export function sortNews<T extends Pick<NewsRow, 'source_published_on' | 'published_at'>>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => {
    const byOriginal = (b.source_published_on ?? '').localeCompare(a.source_published_on ?? '')
    if (byOriginal !== 0) return byOriginal
    return (b.published_at ?? '').localeCompare(a.published_at ?? '')
  })
}

/** Public paths of one item in both locales, relative to the site root. */
export function newsPaths(slugRo: string, slugEn: string | null): { ro: string; en: string } {
  return { ro: `/noutati/${slugRo}`, en: `/en/news/${filled(slugEn) ?? slugRo}` }
}

/** Host of the source, without `www.`, for display next to a link. */
export function sourceHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
