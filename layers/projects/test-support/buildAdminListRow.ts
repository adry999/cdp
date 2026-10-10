import type { AdminProjectListRow } from '#layers/projects/domain/projectSelect'

export function buildAdminListRow(overrides: Partial<AdminProjectListRow> = {}): AdminProjectListRow {
  return {
    slug_ro: 'saas-logistica',
    slug_en: 'logistics-saas',
    card_title_ro: 'Card',
    title_ro: 'Titlu',
    summary_ro: 'Sumar',
    lead_ro: 'Lead',
    context_body_ro: 'Problema',
    tech: ['Nuxt'],
    cover_path: null,
    published_at: null,
    featured: false,
    sort_order: 0,
    live_url: null,
    screens_demo: false,
    quote_ro: null,
    win_value_ro: null,
    project_images: [],
    project_stats: [],
    ...overrides,
  }
}
