import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '#layers/core/shared/types/database.types'
import { logAndThrow } from '#layers/core/server/utils/logAndThrow'
import { projectHasEnglish } from '#layers/projects/domain/mapProject'
import { NAV_PROJECT_SELECT, PROJECT_CARD_SELECT, PROJECT_SELECT } from '#layers/projects/domain/projectSelect'

export interface PublishedProjectSlugs {
  ro: string
  en: string | null
  updatedAt: string
  /** The English title and lead are both filled in. */
  hasEnglish: boolean
}

export function createProjectRepository(event: H3Event) {
  return {
    async listPublishedCards() {
      const client = await serverSupabaseClient(event)
      const { data, error } = await client
        .from('projects')
        .select(PROJECT_CARD_SELECT)
        .not('published_at', 'is', null)
        .order('sort_order')

      if (error) logAndThrow('GET /api/projects', error)
      return data
    },

    async listPublishedNavRows() {
      const client = await serverSupabaseClient<Database>(event)
      const { data, error } = await client
        .from('projects')
        .select(NAV_PROJECT_SELECT)
        .not('published_at', 'is', null)
        .order('sort_order')

      if (error) logAndThrow('GET /api/projects/nav', error)
      return data
    },

    async findPublishedBySlug(slug: string) {
      const client = await serverSupabaseClient(event)
      const { data, error } = await client
        .from('projects')
        .select(PROJECT_SELECT)
        .not('published_at', 'is', null)
        .or(`slug_ro.eq.${slug},slug_en.eq.${slug}`)
        .order('sort_order', { foreignTable: 'project_facts' })
        .order('sort_order', { foreignTable: 'project_stack' })
        .order('sort_order', { foreignTable: 'project_stats' })
        .order('sort_order', { foreignTable: 'project_images' })
        .maybeSingle()

      if (error) logAndThrow(`GET /api/projects/${slug}`, error)
      return data
    },

    async listPublishedSlugs(): Promise<PublishedProjectSlugs[]> {
      const client = await serverSupabaseClient(event)
      const { data, error } = await client
        .from('projects')
        .select('slug_ro, slug_en, title_en, lead_en, updated_at')
        .not('published_at', 'is', null)
        .order('sort_order')

      if (error) logAndThrow('listPublishedProjectSlugs', error)
      return (data ?? []).map((p) => ({ ro: p.slug_ro, en: p.slug_en, updatedAt: p.updated_at, hasEnglish: projectHasEnglish(p) }))
    },

    // Errors are ignored on purpose: a failed lookup falls through to the normal route.
    async findRedirect(fromPath: string) {
      const client = await serverSupabaseClient<Database>(event)
      const { data } = await client.from('redirects').select('to_path, status').eq('from_path', fromPath).maybeSingle()
      return data
    },
  }
}
