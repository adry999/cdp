import type { AppError } from '#layers/core/shared/types/app-error'
import type { Database } from '#layers/core/shared/types/database.types'
import type { LeadStatus } from '#layers/leads/domain/lead'

type SupabaseClient = ReturnType<typeof useSupabaseClient<Database>>

const LEAD_LIST_COLUMNS = 'id, created_at, name, email, company, budget, message, status, archived_at'

function failure(message: string, cause: unknown): AppError {
  return { code: 'unexpected', message, cause }
}

export function createLeadsAdminRepository(client: SupabaseClient) {
  return {
    async listActive() {
      const { data, error } = await client
        .from('leads')
        .select(LEAD_LIST_COLUMNS)
        .is('archived_at', null)
        .order('created_at', { ascending: false })
      if (error) throw failure('Solicitările nu au putut fi încărcate.', error)
      return data ?? []
    },

    async countNew() {
      const { count, error } = await client
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'nou')
        .is('archived_at', null)
      if (error) throw failure('Numărul de solicitări noi nu a putut fi încărcat.', error)
      return count ?? 0
    },

    async get(id: string) {
      const { data, error } = await client.from('leads').select('*').eq('id', id).single()
      if (error) throw failure('Solicitarea nu a putut fi încărcată.', error)
      return data
    },

    async updateStatus(id: string, status: LeadStatus) {
      const { error } = await client.from('leads').update({ status }).eq('id', id)
      if (error) throw failure(`Starea nu a putut fi schimbată: ${error.message}`, error)
    },

    async updateNotes(id: string, notes: string) {
      const { error } = await client.from('leads').update({ notes }).eq('id', id)
      if (error) throw failure(`Notele nu au fost salvate: ${error.message}`, error)
    },

    async archive(id: string) {
      const { error } = await client.from('leads').update({ archived_at: new Date().toISOString() }).eq('id', id)
      if (error) throw failure(`Solicitarea nu a putut fi arhivată: ${error.message}`, error)
    },
  }
}
