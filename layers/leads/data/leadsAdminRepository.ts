import type { AppError } from '#layers/core/shared/types/app-error'
import type { Database } from '#layers/core/shared/types/database.types'
import type { LeadStatus } from '#layers/leads/domain/lead'

type SupabaseClient = ReturnType<typeof useSupabaseClient<Database>>

const LEAD_LIST_COLUMNS = 'id, created_at, name, email, company, budget, service, stage, message, status, archived_at'

function failure(message: string, cause: unknown): AppError {
  return { code: 'unexpected', message, cause }
}

export function createLeadsAdminRepository(client: SupabaseClient) {
  // RLS (or a lead deleted in another tab) blocks an update without an error; the row count tells.
  async function updateOne(id: string, patch: Database['public']['Tables']['leads']['Update'], what: string) {
    const { error, count } = await client.from('leads').update(patch, { count: 'exact' }).eq('id', id)
    if (error) throw failure(`${what}: ${error.message}`, error)
    if (count !== 1) throw failure(`${what}.`, null)
  }

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

    async listArchived() {
      const { data, error } = await client
        .from('leads')
        .select(LEAD_LIST_COLUMNS)
        .not('archived_at', 'is', null)
        .order('archived_at', { ascending: false })
      if (error) throw failure('Solicitările arhivate nu au putut fi încărcate.', error)
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

    // null for an unknown id (the page answers 404); only a real failure throws.
    async get(id: string) {
      const { data, error } = await client.from('leads').select('*').eq('id', id).maybeSingle()
      if (error) throw failure('Solicitarea nu a putut fi încărcată.', error)
      return data
    },

    updateStatus: (id: string, status: LeadStatus) => updateOne(id, { status }, 'Starea nu a putut fi schimbată'),
    updateNotes: (id: string, notes: string) => updateOne(id, { notes }, 'Notele nu au fost salvate'),
    archive: (id: string) => updateOne(id, { archived_at: new Date().toISOString() }, 'Solicitarea nu a putut fi arhivată'),
    unarchive: (id: string) => updateOne(id, { archived_at: null }, 'Solicitarea nu a putut fi dezarhivată'),

    // Erasure on request (privacy policy); RLS returns no error for a blocked delete, so the row count is checked.
    async remove(id: string) {
      const { error, count } = await client.from('leads').delete({ count: 'exact' }).eq('id', id)
      if (error) throw failure(`Solicitarea nu a putut fi ștearsă: ${error.message}`, error)
      if (count !== 1) throw failure('Solicitarea nu a putut fi ștearsă.', null)
    },
  }
}
