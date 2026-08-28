import { SERVICE_STAGE_DEFS, type ServiceStage } from '~/types/services'

/**
 * Joins the structural stage defs (app/types/services.ts — order + icon) with
 * their localised copy from the `home.services.stages.<id>` i18n block, producing
 * the `ServiceStage` view-models HomeServices.vue renders. All editable text
 * lives in i18n/locales/{ro,en}.json under `home.services`; nothing here.
 */
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
