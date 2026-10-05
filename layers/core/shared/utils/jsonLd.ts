// schema.org JSON-LD builders; each returns a plain object to stringify into a ld+json script.

export interface BreadcrumbItem {
  name: string
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

export function organizationRef(siteUrl: string) {
  return { '@type': 'Organization', name: 'Codepedia', url: siteUrl }
}
