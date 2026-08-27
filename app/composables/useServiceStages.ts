import { SERVICE_STAGE_DEFS, type ServiceStage } from '~/types/services'

/**
 * Resolves the static stage defs (app/types/services.ts) into fully-localised
 * `ServiceStage` view-models for HomeServices.vue. Every string except the tech
 * badges comes from the shared `qualifier.*` i18n block, so the growth timeline
 * and the qualifier modal always read the same numbers and phrasing.
 */
export function useServiceStages() {
  const { t } = useI18n()

  return computed<ServiceStage[]>(() =>
    SERVICE_STAGE_DEFS.map((def) => ({
      ...def,
      stageLabel: t(`qualifier.offer.${def.offerKey}.kicker`),
      title: t(`qualifier.offer.${def.offerKey}.title`),
      clientReality: t(`qualifier.stage.options.${def.id}.title`),
      delivery: t(`qualifier.stage.options.${def.id}.hint`),
      priceOrTime: `${t(`qualifier.stage.options.${def.id}.budget`)} · ${t(`qualifier.stage.options.${def.id}.timeline`)}`,
    })),
  )
}
