import type { AppError } from '#layers/core/shared/types/app-error'
import type { Database } from '#layers/core/shared/types/database.types'
import { isHeroChoice, type HeroChoice } from '#layers/home/domain/heroVariant'

type SupabaseClient = ReturnType<typeof useSupabaseClient<Database>>

function failure(message: string, cause: unknown): AppError {
  return { code: 'unexpected', message, cause }
}

/** Reads and updates the single `home_settings` row through the admin's session: RLS (`admin_update_home_settings`) is the access rule. */
export function createHomeSettingsAdminRepository(client: SupabaseClient) {
  return {
    async getHeroVariant(): Promise<HeroChoice | null> {
      const { data, error } = await client.from('home_settings').select('hero_variant').eq('id', 1).maybeSingle()
      if (error) throw failure('Setarea nu a putut fi încărcată.', error)
      return isHeroChoice(data?.hero_variant) ? data.hero_variant : null
    },

    /** `null` clears the choice, so the homepage falls back to the env variable. */
    async setHeroVariant(choice: HeroChoice | null): Promise<void> {
      const { data, error } = await client.from('home_settings').update({ hero_variant: choice }).eq('id', 1).select('id').maybeSingle()
      if (error) throw failure('Setarea nu a putut fi salvată.', error)
      // RLS turns a blocked update into zero rows rather than an error.
      if (!data) throw failure('Setarea nu a putut fi salvată.', null)
    },
  }
}
