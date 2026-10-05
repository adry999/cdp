export type SiteLocale = 'ro' | 'en'

export function useSiteLocale(): ComputedRef<SiteLocale> {
  const { locale } = useI18n()
  return computed(() => locale.value as SiteLocale)
}
