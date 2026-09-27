import { SERVICE_STAGE_DEFS, type ServiceStage } from '#layers/content/domain/services'

// Joins services.ts's stage order with `home.services.stages.<id>` i18n copy into the
// ServiceStage view-models HomeServices.vue renders.
export function useServiceStages() {
  const { t, tm, rt } = useI18n()

  return computed<ServiceStage[]>(() =>
    SERVICE_STAGE_DEFS.map((def) => ({
      ...def,
      name: t(`home.services.stages.${def.id}.name`),
      priceTime: t(`home.services.stages.${def.id}.priceTime`),
      whereYouAre: t(`home.services.stages.${def.id}.whereYouAre`),
      whatYouGet: t(`home.services.stages.${def.id}.whatYouGet`),
      badges: (tm(`home.services.stages.${def.id}.badges`) as unknown[]).map((entry) => rt(entry as string)),
      cta: t(`home.services.stages.${def.id}.cta`),
    })),
  )
}
