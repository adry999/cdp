import { serverSupabaseClient } from '#supabase/server'
import { logAndThrow } from '~~/shared/utils/apiError'

/** Minimal XML escaping — slugs and the site URL are the only inputs here, but
 * a slug is admin-entered text and should never be trusted verbatim in markup. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const baseUrl = config.public.siteUrl.replace(/\/$/, '')

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('projects')
    .select('slug_ro, slug_en')
    .not('published_at', 'is', null)
    .order('sort_order')

  if (error) logAndThrow('GET /sitemap.xml', error)
  const slugs = (data ?? []).map((p) => ({ ro: p.slug_ro, en: p.slug_en ?? p.slug_ro }))

  const urls: { loc: string; alt?: { hreflang: string; href: string }[] }[] = [
    {
      loc: `${baseUrl}/`,
      alt: [
        { hreflang: 'ro', href: `${baseUrl}/` },
        { hreflang: 'en', href: `${baseUrl}/en` },
      ],
    },
    {
      loc: `${baseUrl}/en`,
      alt: [
        { hreflang: 'ro', href: `${baseUrl}/` },
        { hreflang: 'en', href: `${baseUrl}/en` },
      ],
    },
    {
      loc: `${baseUrl}/confidentialitate`,
      alt: [
        { hreflang: 'ro', href: `${baseUrl}/confidentialitate` },
        { hreflang: 'en', href: `${baseUrl}/en/privacy` },
      ],
    },
    {
      loc: `${baseUrl}/en/privacy`,
      alt: [
        { hreflang: 'ro', href: `${baseUrl}/confidentialitate` },
        { hreflang: 'en', href: `${baseUrl}/en/privacy` },
      ],
    },
    ...slugs.flatMap(({ ro, en }) => [
      {
        loc: `${baseUrl}/proiecte/${ro}`,
        alt: [
          { hreflang: 'ro', href: `${baseUrl}/proiecte/${ro}` },
          { hreflang: 'en', href: `${baseUrl}/en/work/${en}` },
        ],
      },
      {
        loc: `${baseUrl}/en/work/${en}`,
        alt: [
          { hreflang: 'ro', href: `${baseUrl}/proiecte/${ro}` },
          { hreflang: 'en', href: `${baseUrl}/en/work/${en}` },
        ],
      },
    ]),
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
${(url.alt ?? []).map((a) => `    <xhtml:link rel="alternate" hreflang="${escapeXml(a.hreflang)}" href="${escapeXml(a.href)}" />`).join('\n')}
  </url>`,
  )
  .join('\n')}
</urlset>`

  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return body
})
