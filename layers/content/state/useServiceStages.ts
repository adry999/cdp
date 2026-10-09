import { useI18n, useI18nList } from '#imports'
import { computed } from 'vue'
import { SERVICE_STAGE_DEFS } from '#layers/content/domain/services'

export async function useServiceStages() {
  const { t } = useI18n()
  const i18nList = useI18nList()

  return computed(() => {

    return SERVICE_STAGE_DEFS.map((def) => {
      const pricing = t(`home.services.stages.${def.id}.pricing`)
      const timing = t(`home.services.stages.${def.id}.timing`)
      const pricingTooltip = t(`home.services.stages.${def.id}.pricingTooltip`)
      
      return {
        ...def,
        name: t(`home.services.stages.${def.id}.name`),
        priceTime: `${pricing} · ${timing}`,
        whereYouAre: t(`home.services.stages.${def.id}.whereYouAre`),
        whatYouGet: t(`home.services.stages.${def.id}.whatYouGet`),
        whyUs: t(`home.services.stages.${def.id}.whyUs`),
        badges: i18nList(`home.services.stages.${def.id}.badges`),
        cta: t(`home.services.stages.${def.id}.cta`),
        pricingTooltip,
        pricing,
        timing
      }
    })
  })
}
