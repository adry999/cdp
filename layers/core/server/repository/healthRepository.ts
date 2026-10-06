import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '#layers/core/shared/types/database.types'

export async function pingDatabase(event: H3Event): Promise<{ message: string } | null> {
  const client = serverSupabaseServiceRole<Database>(event)
  const { error } = await client.from('projects').select('id').limit(1)
  return error
}
