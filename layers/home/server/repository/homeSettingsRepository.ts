import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '#layers/core/shared/types/database.types'
import { logAndThrow } from '#layers/core/server/utils/logAndThrow'
import { isHeroChoice, type HeroChoice } from '#layers/home/domain/heroVariant'

/** Public read: the session client is the anon role here, and RLS (`public_read_home_settings`) allows the select. */
export function createHomeSettingsRepository(event: H3Event) {
  return {
    /** `null` when the admin has not chosen one (or the stored value is not a known choice). */
    async getHeroVariant(): Promise<HeroChoice | null> {
      const client = await serverSupabaseClient<Database>(event)
      const { data, error } = await client.from('home_settings').select('hero_variant').eq('id', 1).maybeSingle()
      if (error) logAndThrow('GET /api/home/settings', error)
      return isHeroChoice(data?.hero_variant) ? data.hero_variant : null
    },
  }
}
