/** One page in both locales, as paths relative to the site root. */
export interface SitemapPage {
  ro: string
  en: string
  lastmod?: string
  /** The EN copy is still Romanian: the sitemap lists the RO URL only. */
  enPending?: boolean
}

export interface SitemapUrl {
  loc: string
  lastmod?: string
  alt: { hreflang: string; href: string }[]
}
