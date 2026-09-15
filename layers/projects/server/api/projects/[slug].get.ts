import { serverSupabaseClient } from '#supabase/server'
import { logAndThrow } from '#layers/core/server/utils/logAndThrow'
import { PROJECT_SELECT } from '#layers/projects/domain/projectSelect'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }
  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('projects')
    .select(PROJECT_SELECT)
    .not('published_at', 'is', null)
    .or(`slug_ro.eq.${slug},slug_en.eq.${slug}`)
    .order('sort_order', { foreignTable: 'project_facts' })
    .order('sort_order', { foreignTable: 'project_steps' })
    .order('sort_order', { foreignTable: 'project_stats' })
    .order('sort_order', { foreignTable: 'project_images' })
    .maybeSingle()

  if (error) logAndThrow(`GET /api/projects/${slug}`, error)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  return data
})
