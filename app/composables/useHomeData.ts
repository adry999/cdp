import type { HomeApiResponse } from '~/types/home'

// Every public section (HomeContact, HomeWork, SiteFooter, the case-study
// footer, index.vue …) reads the same /api/home payload under the shared
// 'home' key. Nuxt already dedupes by key, but its dev-only NUXT_E3004 check
// warns when the same key is used with a different *handler reference* — which
// is what a fresh `() => $fetch('/api/home')` closure per call site produced.
// Routing everyone through this one module-level handler keeps that reference
// identical, so the warning goes away and the intent ("one request, shared")
// is stated in one place.
const fetchHome = (): Promise<HomeApiResponse> => $fetch<HomeApiResponse>('/api/home')

export function useHomeData(options?: { immediate?: boolean; lazy?: boolean }) {
  return useAsyncData('home', fetchHome, options)
}
