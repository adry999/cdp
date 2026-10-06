import type { SitemapPage, SitemapUrl } from '#layers/core/shared/types/sitemap'
import { escapeXml } from '#layers/core/shared/utils/escapeXml'
import type { SiteOrigins } from '#layers/core/shared/utils/siteOrigins'

/** Postgres timestamptz -> sitemap <lastmod> date (YYYY-MM-DD). Real dates
 * only — static pages with no underlying record are never given one. */
export function toLastmod(value: string): string {
  return new Date(value).toISOString().slice(0, 10)
}

/** Each URL sits on its locale's official domain. x-default points at the EN
 * URL on the primary domain. A page whose EN copy is still Romanian lists only
 * its RO URL, with no EN alternate. */
export function toSitemapUrls(origins: SiteOrigins, pages: readonly SitemapPage[]): SitemapUrl[] {
  return pages.flatMap((page) => {
    const ro = `${origins.ro}${page.ro}`
    const en = `${origins.en}${page.en}`
    if (page.enPending) {
      return [{ loc: ro, lastmod: page.lastmod, alt: [] }]
    }
    const alt = [
      { hreflang: 'ro', href: ro },
      { hreflang: 'en', href: en },
      { hreflang: 'x-default', href: en },
    ]
    return [
      { loc: ro, lastmod: page.lastmod, alt },
      { loc: en, lastmod: page.lastmod, alt },
    ]
  })
}

/** On an official domain, only the URLs it is canonical for; anywhere else, all of them. */
export function sitemapUrlsForOrigin(urls: readonly SitemapUrl[], origin: string | undefined): SitemapUrl[] {
  if (!origin) return [...urls]
  return urls.filter((url) => url.loc === origin || url.loc.startsWith(`${origin}/`))
}

export function renderSitemap(urls: readonly SitemapUrl[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
${url.lastmod ? `    <lastmod>${escapeXml(url.lastmod)}</lastmod>\n` : ''}${url.alt.map((a) => `    <xhtml:link rel="alternate" hreflang="${escapeXml(a.hreflang)}" href="${escapeXml(a.href)}" />`).join('\n')}
  </url>`,
  )
  .join('\n')}
</urlset>`
}
