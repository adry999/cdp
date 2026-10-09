import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '#layers/core/shared/types/database.types'
import { logAndThrow } from '#layers/core/server/utils/logAndThrow'
import { NEWS_SELECT } from '#layers/news/domain/newsSelect'

/** Published items only: the session client is the anon role here, and RLS (`public_read_news`) enforces the same filter. */
export function createNewsRepository(event: H3Event) {
  return {
    // Newest original first, then newest on our side; undated originals last.
    async listPublished() {
      const client = await serverSupabaseClient<Database>(event)
      const { data, error } = await client
        .from('news_items')
        .select(NEWS_SELECT)
        .not('published_at', 'is', null)
        .order('source_published_on', { ascending: false, nullsFirst: false })
        .order('published_at', { ascending: false })

      if (error) logAndThrow('GET /api/news', error)
      return data
    },

    async findPublishedBySlug(slug: string) {
      const client = await serverSupabaseClient<Database>(event)
      const { data, error } = await client
        .from('news_items')
        .select(NEWS_SELECT)
        .not('published_at', 'is', null)
        .or(`slug_ro.eq.${slug},slug_en.eq.${slug}`)
        .limit(1)
        .maybeSingle()

      if (error) logAndThrow(`GET /api/news/${slug}`, error)
      return data
    },

    async listPublishedForSitemap() {
      const client = await serverSupabaseClient<Database>(event)
      const { data, error } = await client
        .from('news_items')
        .select('slug_ro, slug_en, title_en, summary_en, updated_at')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })

      if (error) logAndThrow('listNewsSitemapPages', error)
      return data
    },
  }
}
