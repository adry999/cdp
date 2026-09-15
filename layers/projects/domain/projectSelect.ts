/**
 * The column list every project query selects: public routes use
 * `PROJECT_SELECT`, the admin editor `ADMIN_PROJECT_SELECT`. The editor saves
 * back what it loaded, so any column the RPC writes (e.g. `project_images.aspect`)
 * must be selected here too.
 */
export const PROJECT_SELECT = `
  slug_ro, slug_en, title_ro, title_en, card_title_ro, card_title_en,
  summary_ro, summary_en, lead_ro, lead_en, year, tech, service_tag,
  cover_path, cover_alt_ro, cover_alt_en, hero_path, hero_alt_ro, hero_alt_en,
  context_heading_ro, context_heading_en, context_body_ro, context_body_en,
  solution_heading_ro, solution_heading_en,
  quote_ro, quote_en, quote_author, quote_role_ro, quote_role_en, quote_company,
  next_title_ro, next_title_en, sort_order,
  project_facts(label_ro,label_en,value_ro,value_en,sort_order),
  project_steps(title_ro,title_en,body_ro,body_en,sort_order),
  project_stats(value,label_ro,label_en,sort_order),
  project_images(path,alt_ro,alt_en,aspect,sort_order)
`

export const ADMIN_PROJECT_SELECT = `id, published_at, ${PROJECT_SELECT}`
