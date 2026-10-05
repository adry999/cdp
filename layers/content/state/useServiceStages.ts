import { SERVICE_STAGE_DEFS, type ServiceStage } from '#layers/content/domain/services'

// Joins services.ts's stage order with `home.services.stages.<id>` i18n copy into the
// ServiceStage view-models HomeServices.vue renders.
export function useServiceStages() {
  const { t } = useI18n()
  const i18nList = useI18nList()

  return computed<ServiceStage[]>(() =>
    SERVICE_STAGE_DEFS.map((def) => ({
      ...def,
      name: t(`home.services.stages.${def.id}.name`),
      priceTime: t(`home.services.stages.${def.id}.priceTime`),
      whereYouAre: t(`home.services.stages.${def.id}.whereYouAre`),
      whatYouGet: t(`home.services.stages.${def.id}.whatYouGet`),
      badges: i18nList(`home.services.stages.${def.id}.badges`),
      cta: t(`home.services.stages.${def.id}.cta`),
    })),
  )
}
