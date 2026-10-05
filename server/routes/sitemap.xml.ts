import { listPublishedBlogPosts } from '#layers/blog/server'
import { escapeXml } from '#layers/core/shared/utils/escapeXml'
import { isEnPendingTranslation } from '#layers/core/shared/utils/enPendingTranslation'
import { listPublishedProjectSlugs } from '#layers/projects/server'
import { SERVICES } from '#layers/services/server'

// One page in both locales, as paths relative to the site root.
interface PagePair {
  ro: string
  en: string
  lastmod?: string
}

interface SitemapUrl {
  loc: string
  lastmod?: string
  alt: { hreflang: string; href: string }[]
}

// Postgres timestamptz -> sitemap <lastmod> date (YYYY-MM-DD). Real dates
// only — static pages with no underlying record are never given one.
function toLastmod(value: string) {
  return new Date(value).toISOString().slice(0, 10)
}

// x-default points search engines at the RO page when no other alternate
// matches the visitor's language — RO is the site's default locale
// (i18n.defaultLocale / strategy: prefix_except_default). A page whose EN copy
// is still Romanian lists only its RO URL, with no EN alternate.
function toUrls(baseUrl: string, page: PagePair): SitemapUrl[] {
  const ro = `${baseUrl}${page.ro}`
  const en = `${baseUrl}${page.en}`
  if (isEnPendingTranslation(page.ro)) {
    return [{ loc: ro, lastmod: page.lastmod, alt: [] }]
  }
  const alt = [
    { hreflang: 'ro', href: ro },
    { hreflang: 'en', href: en },
    { hreflang: 'x-default', href: ro },
  ]
  return [
    { loc: ro, lastmod: page.lastmod, alt },
    { loc: en, lastmod: page.lastmod, alt },
  ]
}

// The sitemap must not fail with the database: without projects it still
// lists every static page.
async function projectPages(event: Parameters<typeof listPublishedProjectSlugs>[0]): Promise<PagePair[]> {
  try {
    const projects = await listPublishedProjectSlugs(event)
    return projects.map(({ ro, en, updatedAt }) => ({
      ro: `/proiecte/${ro}`,
      en: `/en/work/${en ?? ro}`,
      lastmod: toLastmod(updatedAt),
    }))
  } catch (error) {
    console.warn('[sitemap] project slugs unavailable, listing static pages only', error)
    return []
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const baseUrl = config.public.siteUrl.replace(/\/$/, '')

  // content.test.ts guarantees the RO and EN slug sets match, so the RO list
  // alone enumerates every post in both locales.
  const roPosts = await listPublishedBlogPosts(event, 'ro')

  const pages: PagePair[] = [
    { ro: '/', en: '/en' },
    { ro: '/proiecte', en: '/en/work' },
    { ro: '/confidentialitate', en: '/en/privacy' },
    ...(await projectPages(event)),
    // The blog index is noindex while it has no posts.
    ...(roPosts.length ? [{ ro: '/blog', en: '/en/blog' }] : []),
    ...roPosts.map(({ slug, date }) => ({ ro: `/blog/${slug}`, en: `/en/blog/${slug}`, lastmod: date })),
    { ro: '/servicii', en: '/en/services' },
    { ro: '/contact', en: '/en/contact' },
    { ro: '/despre', en: '/en/about' },
    { ro: '/preturi', en: '/en/pricing' },
    ...SERVICES.map(({ routeSlug }) => ({
      ro: `/servicii/${routeSlug.ro}`,
      en: `/en/services/${routeSlug.en}`,
    })),
  ]

  const urls = pages.flatMap((page) => toUrls(baseUrl, page))

  const body = `<?xml version="1.0" encoding="UTF-8"?>
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

  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return body
})
