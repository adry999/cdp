import { createHomeSettingsRepository } from '#layers/home/server/repository/homeSettingsRepository'

export default defineEventHandler(async (event) => ({
  heroVariant: await createHomeSettingsRepository(event).getHeroVariant(),
}))
