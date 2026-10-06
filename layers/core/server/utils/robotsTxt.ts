/** A preview build (NUXT_PUBLIC_NOINDEX) still lets crawlers in, so they can read the
 * X-Robots-Tag noindex header; it only stops advertising the sitemap. */
export function robotsTxt(baseUrl: string, noindex: boolean): string {
  return `User-agent: *
Disallow: /admin
Disallow: /api/
${noindex ? '' : `\nSitemap: ${baseUrl}/sitemap.xml\n`}`
}
