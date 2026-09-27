import { listPublishedBlogPosts } from '#layers/blog/server'
import { escapeXml } from '#layers/core/shared/utils/escapeXml'
import { listPublishedProjectSlugs } from '#layers/projects/server'
import { SERVICES } from '#layers/services/server'

interface SitemapUrl {
  loc: string
  lastmod?: string
  alt: { hreflang: string; href: string }[]
}

// x-default points search engines at the RO page when no other alternate
// matches the visitor's language — RO is the site's default locale
// (i18n.defaultLocale / strategy: prefix_except_default).
function alternates(ro: string, en: string) {
  return [
    { hreflang: 'ro', href: ro },
    { hreflang: 'en', href: en },
    { hreflang: 'x-default', href: ro },
  ]
}

// Postgres timestamptz -> sitemap <lastmod> date (YYYY-MM-DD). Real dates
// only — static pages with no underlying record are never given one.
function toLastmod(value: string) {
  return new Date(value).toISOString().slice(0, 10)
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const baseUrl = config.public.siteUrl.replace(/\/$/, '')

  const projects = await listPublishedProjectSlugs(event)

  // content.test.ts guarantees the RO and EN slug sets match, so the RO list
  // alone enumerates every post in both locales.
  const roPosts = await listPublishedBlogPosts(event, 'ro')

  const urls: SitemapUrl[] = [
    {
      loc: `${baseUrl}/`,
      alt: alternates(`${baseUrl}/`, `${baseUrl}/en`),
    },
    {
      loc: `${baseUrl}/en`,
      alt: alternates(`${baseUrl}/`, `${baseUrl}/en`),
    },
    {
      loc: `${baseUrl}/proiecte`,
      alt: alternates(`${baseUrl}/proiecte`, `${baseUrl}/en/work`),
    },
    {
      loc: `${baseUrl}/en/work`,
      alt: alternates(`${baseUrl}/proiecte`, `${baseUrl}/en/work`),
    },
    {
      loc: `${baseUrl}/confidentialitate`,
      alt: alternates(`${baseUrl}/confidentialitate`, `${baseUrl}/en/privacy`),
    },
    {
      loc: `${baseUrl}/en/privacy`,
      alt: alternates(`${baseUrl}/confidentialitate`, `${baseUrl}/en/privacy`),
    },
    ...projects.flatMap(({ ro, en, updatedAt }) => {
      const enSlug = en ?? ro
      const lastmod = toLastmod(updatedAt)
      return [
        {
          loc: `${baseUrl}/proiecte/${ro}`,
          lastmod,
          alt: alternates(`${baseUrl}/proiecte/${ro}`, `${baseUrl}/en/work/${enSlug}`),
        },
        {
          loc: `${baseUrl}/en/work/${enSlug}`,
          lastmod,
          alt: alternates(`${baseUrl}/proiecte/${ro}`, `${baseUrl}/en/work/${enSlug}`),
        },
      ]
    }),
    {
      loc: `${baseUrl}/blog`,
      alt: alternates(`${baseUrl}/blog`, `${baseUrl}/en/blog`),
    },
    {
      loc: `${baseUrl}/en/blog`,
      alt: alternates(`${baseUrl}/blog`, `${baseUrl}/en/blog`),
    },
    ...roPosts.flatMap(({ slug, date }) => [
      {
        loc: `${baseUrl}/blog/${slug}`,
        lastmod: date,
        alt: alternates(`${baseUrl}/blog/${slug}`, `${baseUrl}/en/blog/${slug}`),
      },
      {
        loc: `${baseUrl}/en/blog/${slug}`,
        lastmod: date,
        alt: alternates(`${baseUrl}/blog/${slug}`, `${baseUrl}/en/blog/${slug}`),
      },
    ]),
    ...SERVICES.flatMap(({ routeSlug }) => [
      {
        loc: `${baseUrl}/servicii/${routeSlug.ro}`,
        alt: alternates(`${baseUrl}/servicii/${routeSlug.ro}`, `${baseUrl}/en/services/${routeSlug.en}`),
      },
      {
        loc: `${baseUrl}/en/services/${routeSlug.en}`,
        alt: alternates(`${baseUrl}/servicii/${routeSlug.ro}`, `${baseUrl}/en/services/${routeSlug.en}`),
      },
    ]),
  ]

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
