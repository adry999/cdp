import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '#layers/core/shared/types/database.types'
import { logAndThrow } from '#layers/core/server/utils/logAndThrow'
import type { LeadRecord } from '#layers/leads/domain/lead'
import type { LeadRepository } from '#layers/leads/server/services/submitLead'

export function createLeadRepository(event: H3Event): LeadRepository {
  return {
    async insertLead(record: LeadRecord) {
      // Created on first use, not at request start, so the honeypot and
      // invalid-submission paths never touch Supabase config.
      const client = serverSupabaseServiceRole<Database>(event)
      const { error } = await client.from('leads').insert(record)
      if (error) logAndThrow('POST /api/leads', error)
    },
  }
}
