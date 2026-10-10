import { useI18n, useI18nList } from '#imports'
import { computed, type ComputedRef } from 'vue'
import { SERVICE_STAGE_DEFS, type ServiceStage } from '#layers/content/domain/services'

export function useServiceStages(): ComputedRef<ServiceStage[]> {
  const { t } = useI18n()
  const i18nList = useI18nList()

  return computed(() =>
    SERVICE_STAGE_DEFS.map((def) => {
      const pricing = t(`home.services.stages.${def.id}.pricing`)
      const timing = t(`home.services.stages.${def.id}.timing`)

      return {
        ...def,
        name: t(`home.services.stages.${def.id}.name`),
        priceTime: `${pricing} · ${timing}`,
        whereYouAre: t(`home.services.stages.${def.id}.whereYouAre`),
        whatYouGet: t(`home.services.stages.${def.id}.whatYouGet`),
        whyUs: t(`home.services.stages.${def.id}.whyUs`),
        badges: i18nList(`home.services.stages.${def.id}.badges`),
        cta: t(`home.services.stages.${def.id}.cta`),
        pricingTooltip: t(`home.services.stages.${def.id}.pricingTooltip`),
        pricing,
        timing,
      }
    }),
  )
}
