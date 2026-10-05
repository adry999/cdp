// schema.org JSON-LD builders shared by the public pages. Each returns a plain
// object for `useHead({ script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(...) }] })`.

export interface BreadcrumbItem {
  name: string
  /** Absolute URL. */
  url: string
}

export function breadcrumbList(items: readonly BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
