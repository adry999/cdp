import { TEAM } from '#layers/content'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { createCardStatsRepository } from '#layers/card/data/cardStatsRepository'
import { summarizeCardEvents } from '#layers/card/domain/cardStats'

export type CardStatsPeriod = '30d' | 'all'

const DAY_MS = 24 * 60 * 60 * 1000

export async function useCardStats() {
  const repository = createCardStatsRepository(useSupabaseClient())
  const period = ref<CardStatsPeriod>('30d')
  const cards = TEAM.flatMap((member) => (member.card ? [{ slug: member.card.slug, name: member.name }] : []))

  const { data, error } = await useAsyncData(
    'admin-card-stats',
    async () => {
      const since = period.value === '30d' ? new Date(Date.now() - 30 * DAY_MS).toISOString() : undefined
      const [counts, leads] = await Promise.all([repository.eventCounts(since), repository.leadCount(since)])
      return { rows: summarizeCardEvents(counts, cards), leads }
    },
    { watch: [period] },
  )
  const loadError = computed(() => (error.value ? toAppError(error.value) : null))
  return { stats: data, loadError, period }
}
