import type { MaybeRefOrGetter } from 'vue'
import { collectionPage, type BreadcrumbItem } from '#layers/core/shared/utils/jsonLd'

interface CollectionLd {
  name: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  /** The entries the index page shows, in order, with absolute URLs. */
  items: MaybeRefOrGetter<readonly BreadcrumbItem[]>
}

/** CollectionPage + ItemList JSON-LD for an index page (the current route). */
export function useCollectionLd({ name, description, items }: CollectionLd) {
  const route = useRoute()
  const siteUrl = useSiteUrl()
  const siteLocale = useSiteLocale()

  useJsonLd(() =>
    collectionPage({
      name: toValue(name),
      description: toValue(description),
      url: `${siteUrl}${route.path}`,
      inLanguage: siteLocale.value,
      items: toValue(items),
    }),
  )
}
