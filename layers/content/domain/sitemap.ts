import type { SitemapPage } from '#layers/core/shared/types/sitemap'

export const CONTENT_SITEMAP_PAGES: SitemapPage[] = [
  { ro: '/despre', en: '/en/about', enPending: true },
  { ro: '/preturi', en: '/en/pricing', enPending: true },
]

export const CONTENT_EN_PENDING_PATHS: readonly string[] = CONTENT_SITEMAP_PAGES.filter((page) => page.enPending).map((page) => page.ro)
