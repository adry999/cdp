import type { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '#layers/core/shared/types/database.types'
import { logAndThrow } from '#layers/core/server/utils/logAndThrow'
import type { LeadRecord } from '#layers/leads/domain/lead'
import type { LeadRepository } from '#layers/leads/server/services/submitLead'

type ServiceRoleClient = ReturnType<typeof serverSupabaseServiceRole<Database>>

export function createLeadRepository(client: ServiceRoleClient): LeadRepository {
  return {
    async insertLead(record: LeadRecord) {
      const { error } = await client.from('leads').insert(record)
      if (error) logAndThrow('POST /api/leads', error)
    },
  }
}
