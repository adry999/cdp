import type { SitemapPage } from '#layers/core/shared/types/sitemap'

export const CONTENT_SITEMAP_PAGES: SitemapPage[] = [
  { ro: '/despre', en: '/en/about' },
  { ro: '/preturi', en: '/en/pricing' },
]

export const CONTENT_EN_PENDING_PATHS: readonly string[] = CONTENT_SITEMAP_PAGES.filter((page) => page.enPending).map((page) => page.ro)
