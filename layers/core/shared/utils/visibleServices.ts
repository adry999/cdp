const GRANTS_SLUG = 'granturi'

// The grants service is hidden until `grantsEnabled`. Accepts service slugs or any objects with a
// `slug`, so the header, footer, sitemap and contact form share one rule.
export function visibleServices<T extends string | { slug: string }>(services: readonly T[], grantsEnabled: boolean): T[] {
  return services.filter((service) => (typeof service === 'string' ? service : service.slug) !== GRANTS_SLUG || grantsEnabled)
}
