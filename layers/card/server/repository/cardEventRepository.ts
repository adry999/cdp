import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '#layers/core/shared/types/database.types'
import { logAndThrow } from '#layers/core/server/utils/logAndThrow'
import type { CardEvent } from '#layers/card/domain/cardEvents'

export function createCardEventRepository(event: H3Event) {
  return {
    async insert(cardEvent: CardEvent) {
      const client = serverSupabaseServiceRole<Database>(event)
      const { error } = await client
        .from('card_events')
        .insert({ card_slug: cardEvent.slug, kind: cardEvent.kind, source: cardEvent.source })
      if (error) logAndThrow('POST /api/card/events', error)
    },
  }
}
