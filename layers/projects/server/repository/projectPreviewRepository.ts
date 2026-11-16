import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '#layers/core/shared/types/database.types'
import { logAndThrow } from '#layers/core/server/utils/logAndThrow'
import type { ProjectRow } from '#layers/projects/domain/mapProject'
import { PROJECT_SELECT } from '#layers/projects/domain/projectSelect'

export type PreviewProjectRow = ProjectRow & { published_at: string | null }

// Admin-only reads: the service-role client sees drafts, so every caller checks requireAdmin first
// (server/services/projectPreview.ts).
export function createProjectPreviewRepository(event: H3Event) {
  return {
    /** The saved project by its RO slug, published or not, with the case study's child rows. */
    async findBySlugRo(slug: string): Promise<PreviewProjectRow | null> {
      const client = serverSupabaseServiceRole<Database>(event)
      const { data, error } = await client
        .from('projects')
        .select(`published_at, ${PROJECT_SELECT}`)
        .eq('slug_ro', slug)
        .order('sort_order', { foreignTable: 'project_facts' })
        .order('sort_order', { foreignTable: 'project_stack' })
        .order('sort_order', { foreignTable: 'project_stats' })
        .order('sort_order', { foreignTable: 'project_images' })
        .maybeSingle()

      if (error) logAndThrow(`GET /api/admin/projects/${slug}/preview`, error)
      return data as unknown as PreviewProjectRow | null
    },
  }
}
