import type { Database } from '#layers/core/shared/types/database.types'
import type { AppError } from '#layers/core/shared/types/app-error'
import { CARD_LEADS_FILTER, type CardEventCountRow } from '#layers/card/domain/cardStats'

type SupabaseClient = ReturnType<typeof useSupabaseClient<Database>>

function failure(message: string, cause: unknown): AppError {
  return { code: 'unexpected', message, cause }
}

export function createCardStatsRepository(client: SupabaseClient) {
  return {
    /** Counts per card and kind since `since` (ISO; undefined = all time). RLS: admins only. */
    async eventCounts(since: string | undefined): Promise<CardEventCountRow[]> {
      const { data, error } = await client.rpc('card_event_counts', since ? { p_since: since } : {})
      if (error) throw failure('Statisticile nu au putut fi încărcate.', error)
      return data ?? []
    },

    /** Leads sent from a card page since `since`, archived ones included. */
    async leadCount(since: string | undefined): Promise<number> {
      let query = client.from('leads').select('id', { count: 'exact', head: true }).or(CARD_LEADS_FILTER)
      if (since) query = query.gte('created_at', since)
      const { count, error } = await query
      if (error) throw failure('Cererile din QR nu au putut fi numărate.', error)
      return count ?? 0
    },
  }
}
