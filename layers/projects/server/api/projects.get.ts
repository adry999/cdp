import { serverSupabaseClient } from '#supabase/server'
import { logAndThrow } from '#layers/core/server/utils/logAndThrow'
import { PROJECT_SELECT } from '#layers/projects/domain/projectSelect'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('projects')
    .select(PROJECT_SELECT)
    .not('published_at', 'is', null)
    .order('sort_order')
    .order('sort_order', { foreignTable: 'project_facts' })
    .order('sort_order', { foreignTable: 'project_steps' })
    .order('sort_order', { foreignTable: 'project_stats' })
    .order('sort_order', { foreignTable: 'project_images' })

  if (error) logAndThrow('GET /api/projects', error)
  return data
})
