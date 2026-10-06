/** The official domain of each locale. Every domain serves every page under the
 * same path, so caches keyed by path stay correct; only canonical, hreflang and
 * the sitemap name a page's official domain. */
export interface SiteOrigins {
  ro: string
  en: string
}

export function toSiteOrigins(config: { siteUrl: string; siteUrlRo?: string }): SiteOrigins {
  const en = config.siteUrl.replace(/\/$/, '')
  const ro = (config.siteUrlRo || en).replace(/\/$/, '')
  return { ro, en }
}

/** The official origin served on `host`, or undefined for any other host (a preview URL, localhost). */
export function originForHost(origins: SiteOrigins, host: string | null | undefined): string | undefined {
  if (!host) return undefined
  const normalized = host.toLowerCase().replace(/^www\./, '')
  return [origins.en, origins.ro].find((origin) => new URL(origin).host.replace(/^www\./, '') === normalized)
}
