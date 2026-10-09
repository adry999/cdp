import type { AppError } from '#layers/core/shared/types/app-error'
import type { Database } from '#layers/core/shared/types/database.types'
import type { NewsInsert } from '#layers/news/domain/newsForm'
import {
  ADMIN_NEWS_LIST_SELECT,
  ADMIN_NEWS_SELECT,
  type AdminNewsListRow,
  type AdminNewsRow,
} from '#layers/news/domain/newsSelect'
import type { NewsPreview } from '#layers/news/domain/preview'

type SupabaseClient = ReturnType<typeof useSupabaseClient<Database>>

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const UNIQUE_VIOLATION = '23505'

function failure(message: string, cause: unknown): AppError {
  return { code: 'unexpected', message, cause }
}

function saveFailure(error: { code?: string; message: string }): AppError {
  if (error.code === UNIQUE_VIOLATION) return failure('Slug-ul există deja la altă noutate. Alege altul.', error)
  return failure(error.message, error)
}

/**
 * Plain inserts and updates through the admin's session: RLS (`admin_all_news`) is the whole access rule,
 * and a news item is one row, so unlike `save_project` there is no multi-table write that needs an RPC.
 */
export function createNewsAdminRepository(client: SupabaseClient) {
  return {
    async list(): Promise<AdminNewsListRow[]> {
      const { data, error } = await client
        .from('news_items')
        .select(ADMIN_NEWS_LIST_SELECT)
        .order('created_at', { ascending: false })
      if (error) throw failure('Noutățile nu au putut fi încărcate.', error)
      return data
    },

    /** `idOrSlug` is the row id or its Romanian slug. */
    async get(idOrSlug: string): Promise<AdminNewsRow | null> {
      const query = client.from('news_items').select(ADMIN_NEWS_SELECT)
      const { data, error } = await (UUID_RE.test(idOrSlug) ? query.eq('id', idOrSlug) : query.eq('slug_ro', idOrSlug)).maybeSingle()
      if (error) throw failure('Noutatea nu a putut fi încărcată.', error)
      return data
    },

    async create(row: NewsInsert): Promise<{ id: string; slug_ro: string }> {
      const { data, error } = await client.from('news_items').insert(row).select('id, slug_ro').single()
      if (error) throw saveFailure(error)
      return data
    },

    async update(id: string, row: NewsInsert): Promise<{ id: string; slug_ro: string }> {
      const { data, error } = await client.from('news_items').update(row).eq('id', id).select('id, slug_ro').maybeSingle()
      if (error) throw saveFailure(error)
      // RLS turns a blocked update into zero rows rather than an error.
      if (!data) throw failure('Noutatea nu a putut fi salvată.', null)
      return data
    },

    async remove(id: string) {
      const { error, count } = await client.from('news_items').delete({ count: 'exact' }).eq('id', id)
      if (error) throw failure(`Noutatea nu a putut fi ștearsă: ${error.message}`, error)
      if (count !== 1) throw failure('Noutatea nu a putut fi ștearsă.', null)
    },

    async previewSource(url: string): Promise<NewsPreview> {
      try {
        return await $fetch<NewsPreview>('/api/admin/news/preview', { method: 'POST', body: { url } })
      } catch (caught) {
        const shape = caught as { statusMessage?: string; data?: { statusMessage?: string } } | null
        throw failure(shape?.data?.statusMessage ?? shape?.statusMessage ?? 'Datele nu au putut fi citite din link.', caught)
      }
    },
  }
}
