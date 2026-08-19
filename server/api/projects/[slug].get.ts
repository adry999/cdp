import { serverSupabaseClient } from '#supabase/server'

const PROJECT_SELECT = `
  slug_ro, slug_en, title_ro, title_en, card_title_ro, card_title_en,
  summary_ro, summary_en, lead_ro, lead_en, year, tech,
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

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }
  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('projects')
    .select(PROJECT_SELECT)
    .not('published_at', 'is', null)
    .or(`slug_ro.eq.${slug},slug_en.eq.${slug}`)
    .order('sort_order', { foreignTable: 'project_facts' })
    .order('sort_order', { foreignTable: 'project_steps' })
    .order('sort_order', { foreignTable: 'project_stats' })
    .order('sort_order', { foreignTable: 'project_images' })
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  return data
})
