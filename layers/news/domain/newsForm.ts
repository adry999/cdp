import { CATEGORY_CODES, isCategoryCode } from '#layers/blog'
import type { AdminNewsRow } from '#layers/news/domain/newsSelect'
import type { NewsPreview } from '#layers/news/domain/preview'
import { SLUG_RE, slugify } from '#layers/news/domain/slug'

export interface Bilingual {
  ro: string
  en: string
}

export interface NewsForm {
  slugRo: string
  slugEn: string
  title: Bilingual
  summary: Bilingual
  why: Bilingual
  sourceUrl: string
  sourceName: string
  sourceAuthor: string
  /** `YYYY-MM-DD` or empty. */
  sourceDate: string
  /** A blog category code, or empty for none. */
  category: string
  published: boolean
  /** When the row first went live; kept when the item stays published. */
  publishedAt: string | null
}

export interface NewsIssue {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export type NewsInsert = Omit<AdminNewsRow, 'id'>

/** Guidance, not a limit: the summary is ours, 2-4 sentences, never the source's text. */
export const SUMMARY_SOFT_LIMIT = 600

export const NEWS_CATEGORY_OPTIONS = CATEGORY_CODES

function bilingual(ro: string | null, en: string | null): Bilingual {
  return { ro: ro ?? '', en: en ?? '' }
}

function blankToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function toNewsForm(row: AdminNewsRow | null): NewsForm {
  return {
    slugRo: row?.slug_ro ?? '',
    slugEn: row?.slug_en ?? '',
    title: bilingual(row?.title_ro ?? null, row?.title_en ?? null),
    summary: bilingual(row?.summary_ro ?? null, row?.summary_en ?? null),
    why: bilingual(row?.why_ro ?? null, row?.why_en ?? null),
    sourceUrl: row?.source_url ?? '',
    sourceName: row?.source_name ?? '',
    sourceAuthor: row?.source_author ?? '',
    sourceDate: row?.source_published_on ?? '',
    category: row?.category ?? '',
    published: !!row?.published_at,
    publishedAt: row?.published_at ?? null,
  }
}

/** The slug that will be stored: the typed one, or one derived from the Romanian title. */
export function effectiveSlugRo(form: NewsForm): string {
  return form.slugRo.trim() || slugify(form.title.ro)
}

export function isHttpUrl(value: string): boolean {
  if (!/^https?:\/\//i.test(value)) return false
  try {
    return !!new URL(value).hostname
  } catch {
    return false
  }
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

/**
 * Every problem at once. Errors block saving. Title and URL are always required (the slug and the
 * table's NOT NULL / http check need them); summary and source name only to publish, so a draft can start from a link alone.
 */
export function validateNewsForm(form: NewsForm): NewsIssue[] {
  const issues: NewsIssue[] = []
  const error = (field: string, message: string) => issues.push({ field, message, severity: 'error' })
  const warning = (field: string, message: string) => issues.push({ field, message, severity: 'warning' })

  if (!form.title.ro.trim()) error('title', 'Titlul (RO) este obligatoriu.')

  const url = form.sourceUrl.trim()
  if (!url) error('sourceUrl', 'Link-ul sursei este obligatoriu.')
  else if (!isHttpUrl(url)) error('sourceUrl', 'Link-ul sursei trebuie să înceapă cu http:// sau https://.')

  if (form.published) {
    if (!form.summary.ro.trim()) error('summary', 'Rezumatul (RO) este obligatoriu pentru publicare.')
    if (!form.sourceName.trim()) error('sourceName', 'Numele sursei este obligatoriu pentru publicare.')
  }

  const slugRo = effectiveSlugRo(form)
  if (!slugRo) error('slugRo', 'Slug-ul (RO) este obligatoriu.')
  else if (!SLUG_RE.test(slugRo)) error('slugRo', 'Slug-ul poate conține doar litere mici, cifre și cratime.')
  else if (slugRo === 'nou') error('slugRo', '„nou" este rezervat și nu poate fi slug.')

  const slugEn = form.slugEn.trim()
  if (slugEn && !SLUG_RE.test(slugEn)) error('slugEn', 'Slug-ul (EN) poate conține doar litere mici, cifre și cratime.')

  if (form.sourceDate && !isIsoDate(form.sourceDate)) error('sourceDate', 'Data originalului nu este validă.')
  if (form.category && !isCategoryCode(form.category)) error('category', 'Categorie invalidă.')

  for (const lang of ['ro', 'en'] as const) {
    if (form.summary[lang].length > SUMMARY_SOFT_LIMIT) {
      warning('summary', `Rezumatul (${lang.toUpperCase()}) are ${form.summary[lang].length} caractere. Ține-l la 2–4 propoziții, sub ${SUMMARY_SOFT_LIMIT}.`)
    }
  }
  if (form.published && form.summary.ro.trim() && (!form.title.en.trim() || !form.summary.en.trim())) {
    warning('summary', 'Fără titlu și rezumat EN, pagina în engleză afișează textul în română și nu e indexată.')
  }

  return issues
}

export function blockingIssues(issues: readonly NewsIssue[]): NewsIssue[] {
  return issues.filter((issue) => issue.severity === 'error')
}

/** The row to insert or update. `now` stamps the first publication; empty optional fields become null. */
export function toNewsInsert(form: NewsForm, now: Date): NewsInsert {
  const slugRo = effectiveSlugRo(form)
  const publishedAt = form.published ? (form.publishedAt ?? now.toISOString()) : null
  return {
    slug_ro: slugRo,
    slug_en: blankToNull(form.slugEn),
    title_ro: form.title.ro.trim(),
    title_en: blankToNull(form.title.en),
    summary_ro: form.summary.ro.trim(),
    summary_en: blankToNull(form.summary.en),
    why_ro: blankToNull(form.why.ro),
    why_en: blankToNull(form.why.en),
    source_url: form.sourceUrl.trim(),
    source_name: form.sourceName.trim(),
    source_author: blankToNull(form.sourceAuthor),
    source_published_on: blankToNull(form.sourceDate),
    category: blankToNull(form.category),
    published_at: publishedAt,
  }
}

/** Fills only what is still empty, so a re-run never overwrites the editor's own wording. */
export function applyPreview(form: NewsForm, preview: NewsPreview): NewsForm {
  return {
    ...form,
    title: { ...form.title, ro: form.title.ro.trim() ? form.title.ro : (preview.title ?? '') },
    sourceName: form.sourceName.trim() ? form.sourceName : (preview.siteName ?? ''),
    sourceAuthor: form.sourceAuthor.trim() ? form.sourceAuthor : (preview.author ?? ''),
    sourceDate: form.sourceDate ? form.sourceDate : (preview.publishedOn ?? ''),
  }
}
