import { serverSupabaseClient } from '#supabase/server'
import { logAndThrow } from '#layers/core/server/utils/logAndThrow'
import { PROJECT_CARD_SELECT } from '#layers/projects/domain/projectSelect'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('projects')
    .select(PROJECT_CARD_SELECT)
    .not('published_at', 'is', null)
    .order('sort_order')

  if (error) logAndThrow('GET /api/projects', error)
  return data
})
