import { serverSupabaseClient } from '#supabase/server'
import { logAndThrow } from '~~/shared/utils/apiError'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const [services, stackGroups, processSteps, faqs, settings] = await Promise.all([
    client
      .from('services')
      .select('key,level_label_ro,level_label_en,name_ro,name_en,heading_ro,heading_en,body_ro,body_en,duration_ro,duration_en,price_from,currency,layout,sort_order,service_items(label_ro,label_en,body_ro,body_en,sort_order)')
      .order('sort_order')
      .order('sort_order', { foreignTable: 'service_items' }),
    client.from('stack_groups').select('name,items,sort_order').order('sort_order'),
    client.from('process_steps').select('title_ro,title_en,body_ro,body_en,sort_order').order('sort_order'),
    client
      .from('faqs')
      .select('question_ro,question_en,answer_ro,answer_en,sort_order')
      .not('published_at', 'is', null)
      .order('sort_order'),
    client.from('site_settings').select('*').eq('id', 1).maybeSingle(),
  ])

  for (const r of [services, stackGroups, processSteps, faqs, settings]) {
    if (r.error) logAndThrow('GET /api/home', r.error)
  }

  return {
    services: services.data,
    stackGroups: stackGroups.data,
    processSteps: processSteps.data,
    faqs: faqs.data,
    settings: settings.data,
  }
})
