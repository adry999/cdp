import { useI18n, useI18nList, useAsyncData } from '#imports'
import { computed } from 'vue'
import { SERVICE_STAGE_DEFS, type ServiceStage } from '#layers/content/domain/services'

export async function useServiceStages() {
  const { t } = useI18n()
  const i18nList = useI18nList()

  // Mocking the dynamic data (pricing and timing) with the intention of fetching it from Supabase later.
  const { data: dynamicData } = await useAsyncData('services-dynamic', async () => {
    // In the future: return await supabase.from('services').select('id, pricing_ro, pricing_en, timing_ro, timing_en')
    return [
      { id: 'E', pricing_en: 'Under 1,000 EUR', pricing_ro: 'Sub 1.000 EUR', timing_en: '2–3 days', timing_ro: '2–3 zile' },
      { id: 'B', pricing_en: 'From 1,000 EUR', pricing_ro: 'De la 1.000 EUR', timing_en: '~1 week', timing_ro: '~1 săptămână' },
      { id: 'A', pricing_en: 'From 2,000 EUR', pricing_ro: 'De la 2.000 EUR', timing_en: '3–6 weeks', timing_ro: '3–6 săptămâni' },
      { id: 'C', pricing_en: 'From 2,000 EUR', pricing_ro: 'De la 2.000 EUR', timing_en: '4–8 weeks', timing_ro: '4–8 săptămâni' },
      { id: 'D', pricing_en: 'From 5,000 EUR', pricing_ro: 'De la 5.000 EUR', timing_en: '6–12 weeks', timing_ro: '6–12 săptămâni' }
    ]
  })

  return computed(() => {
    const loc = t('lang') === 'ro' ? 'ro' : 'en'
    
    return SERVICE_STAGE_DEFS.map((def) => {
      const dyn = dynamicData.value?.find(d => d.id === def.id)
      
      const pricing = dyn ? dyn[`pricing_${loc}` as keyof typeof dyn] : ''
      const timing = dyn ? dyn[`timing_${loc}` as keyof typeof dyn] : ''
      
      return {
        ...def,
        name: t(`home.services.stages.${def.id}.name`),
        priceTime: `${pricing} · ${timing}`,
        whereYouAre: t(`home.services.stages.${def.id}.whereYouAre`),
        whatYouGet: t(`home.services.stages.${def.id}.whatYouGet`),
        whyUs: t(`home.services.stages.${def.id}.whyUs`),
        badges: i18nList(`home.services.stages.${def.id}.badges`),
        cta: t(`home.services.stages.${def.id}.cta`),
        pricing,
        timing
      }
    })
  })
}
