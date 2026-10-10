export type LocalizedSlugs = Record<'ro' | 'en', string>

interface SlugsEntry {
  owner: number
  slugs: LocalizedSlugs
}

// The slugs of the dynamic page being shown, so the language switch can link to the counterpart.
// @nuxtjs/i18n keeps them in the route's meta, which the previous page's watcher overwrites on a
// client-side navigation; this state is owned by the page that set it.
function useSlugsEntry() {
  return useState<SlugsEntry | null>('core:localized-slugs', () => null)
}

/** For a page whose slug differs per locale: feeds the language switch and the hreflang alternates. */
export function useSetLocalizedSlugs(slugs: LocalizedSlugs) {
  useSetI18nParams()({ ro: { slug: slugs.ro }, en: { slug: slugs.en } })

  const entry = useSlugsEntry()
  const owner = getCurrentInstance()?.uid ?? 0
  entry.value = { owner, slugs }
  // A newer page may already have taken over when this one is torn down.
  onScopeDispose(() => {
    if (entry.value?.owner === owner) entry.value = null
  })
}

/** The shown page's slugs per locale, or null when its URL is the same in both languages. */
export function useLocalizedSlugs(): ComputedRef<LocalizedSlugs | null> {
  const entry = useSlugsEntry()
  return computed(() => entry.value?.slugs ?? null)
}
