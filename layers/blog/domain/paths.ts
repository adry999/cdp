import { CATEGORIES, type CategoryCode } from './category'

type Locale = 'ro' | 'en'

// No `#layers/...` imports here: layers/blog/nuxt.config.ts loads this file before Nuxt's aliases exist.

/** Public path of a post's generated Open Graph image (written by `scripts/generate-blog-og.mjs`). */
export function ogImagePath(locale: Locale, slug: string): string {
  return `/og/blog/${locale}/${slug}.png`
}

/** Where a blog URL lives, relative to the locale's official origin. */
export function blogPaths(locale: Locale) {
  const prefix = locale === 'en' ? '/en/blog' : '/blog'
  return {
    index: prefix,
    category: (code: CategoryCode) => `${prefix}/${locale === 'en' ? 'category' : 'categorie'}/${CATEGORIES[code].slug[locale]}`,
    post: (slug: string) => `${prefix}/${slug}`,
    rss: `${prefix}/rss.xml`,
  }
}
