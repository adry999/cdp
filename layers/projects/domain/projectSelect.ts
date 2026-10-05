// PROJECT_CARD_SELECT keeps list views (12–30 rows) light; PROJECT_SELECT backs the case
// study route and the admin editor, which saves back what it loads, so every writable column
// must be selected here too.
export const PROJECT_CARD_SELECT = `
  slug_ro, slug_en, card_title_ro, card_title_en, summary_ro, summary_en,
  kind_ro, kind_en, tech, service_tag, featured, cover_path, cover_alt_ro, cover_alt_en, sort_order
`

export const PROJECT_SELECT = `
  slug_ro, slug_en, title_ro, title_en, card_title_ro, card_title_en,
  summary_ro, summary_en, lead_ro, lead_en, year, tech, service_tag, featured,
  cover_path, cover_alt_ro, cover_alt_en, hero_path, hero_alt_ro, hero_alt_en,
  kind_ro, kind_en, tags_ro, tags_en, live_url, live_url_label_ro, live_url_label_en, screens_demo,
  context_body_ro, context_body_en, solution_body_ro, solution_body_en,
  obstacles_body_ro, obstacles_body_en, changes_body_ro, changes_body_en, result_body_ro, result_body_en,
  quote_ro, quote_en, quote_author, quote_role_ro, quote_role_en, quote_company,
  sort_order,
  project_facts(label_ro,label_en,value_ro,value_en,sort_order),
  project_stack(name,role_ro,role_en,sort_order),
  project_stats(value,label_ro,label_en,sort_order),
  project_images(path,alt_ro,alt_en,aspect,sort_order)
`

export const ADMIN_PROJECT_SELECT = `id, published_at, ${PROJECT_SELECT}`
