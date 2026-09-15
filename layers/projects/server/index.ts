import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { logAndThrow } from '#layers/core/server/utils/logAndThrow'

export interface PublishedProjectSlugs {
  ro: string
  en: string | null
}

/** Used by the root sitemap (server/routes/sitemap.xml.ts) to list every
 * published project's per-locale slugs, in display order. */
export async function listPublishedProjectSlugs(event: H3Event): Promise<PublishedProjectSlugs[]> {
  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('projects')
    .select('slug_ro, slug_en')
    .not('published_at', 'is', null)
    .order('sort_order')

  if (error) logAndThrow('listPublishedProjectSlugs', error)
  return (data ?? []).map((p) => ({ ro: p.slug_ro, en: p.slug_en }))
}
