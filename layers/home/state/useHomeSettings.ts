import type { HeroChoice } from '#layers/home/domain/heroVariant'

// The admin's hero choice, read on the server so the cached `/` carries it. If the read fails the
// hero falls back to the env variable. One key, so the page and the hero share a single request.
export function useHomeSettings() {
  return useFetch<{ heroVariant: HeroChoice | null }>('/api/home/settings', {
    key: 'home:settings',
    default: () => ({ heroVariant: null }),
  })
}
