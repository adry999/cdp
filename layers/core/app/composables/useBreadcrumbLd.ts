import type { MaybeRefOrGetter } from 'vue'
import { breadcrumbList } from '#layers/core/shared/utils/jsonLd'
import { BRAND } from '#layers/core/shared/utils/seo'

/** BreadcrumbList JSON-LD for a top-level page: CODEPEDIA home, then the current page. */
export function useBreadcrumbLd(name: MaybeRefOrGetter<string>) {
  const route = useRoute()
  const localePath = useLocalePath()
  const siteUrl = useSiteUrl()

  useJsonLd(() =>
    breadcrumbList([
      { name: BRAND, url: `${siteUrl}${localePath('/')}` },
      { name: toValue(name), url: `${siteUrl}${route.path}` },
    ]),
  )
}
