import { blogPaths } from '#layers/blog'

/** `<link rel="alternate" type="application/rss+xml">` to the current locale's feed, on its official domain. */
export function useBlogRssLink() {
  const { t } = useI18n()
  const siteLocale = useSiteLocale()
  const origin = useSiteUrl()

  useHead(() => ({
    link: [
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: `${t('blog.seo.title')} · RSS`,
        href: `${origin}${blogPaths(siteLocale.value).rss}`,
      },
    ],
  }))
}
