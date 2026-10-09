import type { Database } from '#layers/core/shared/types/database.types'

type NewsTable = Database['public']['Tables']['news_items']['Row']

// Public reads never expose `id`, `created_at` or `updated_by`.
export const NEWS_SELECT =
  'slug_ro, slug_en, title_ro, title_en, summary_ro, summary_en, why_ro, why_en, source_url, source_name, source_author, source_published_on, category, published_at, updated_at'

export type NewsRow = Pick<
  NewsTable,
  | 'slug_ro'
  | 'slug_en'
  | 'title_ro'
  | 'title_en'
  | 'summary_ro'
  | 'summary_en'
  | 'why_ro'
  | 'why_en'
  | 'source_url'
  | 'source_name'
  | 'source_author'
  | 'source_published_on'
  | 'category'
  | 'published_at'
  | 'updated_at'
>

export const ADMIN_NEWS_LIST_SELECT = 'id, slug_ro, title_ro, source_name, source_published_on, published_at, created_at'

export type AdminNewsListRow = Pick<
  NewsTable,
  'id' | 'slug_ro' | 'title_ro' | 'source_name' | 'source_published_on' | 'published_at' | 'created_at'
>

/** Everything the editor reads and writes back. */
export type AdminNewsRow = Omit<NewsTable, 'created_at' | 'updated_at' | 'updated_by'>

export const ADMIN_NEWS_SELECT =
  'id, slug_ro, slug_en, title_ro, title_en, summary_ro, summary_en, why_ro, why_en, source_url, source_name, source_author, source_published_on, category, published_at'
