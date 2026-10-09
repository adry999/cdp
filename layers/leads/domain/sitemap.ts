import type { SitemapPage } from '#layers/core/shared/types/sitemap'

export const LEADS_SITEMAP_PAGES: SitemapPage[] = [{ ro: '/contact', en: '/en/contact' }]

export const LEADS_EN_PENDING_PATHS: readonly string[] = LEADS_SITEMAP_PAGES.filter((page) => page.enPending).map((page) => page.ro)
