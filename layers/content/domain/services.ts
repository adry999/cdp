import { STAGE_ORDER, type StageId } from '#layers/core/shared/types/service-stage'

// Structural defs for the homepage growth timeline; all copy lives in i18n under home.services.
// The DB `services` / `service_items` tables do not feed the homepage — this
// section is i18n-only (see layers/content/README.md).
export interface ServiceStageDef {
  id: StageId
}

export interface ServiceStage extends ServiceStageDef {
  name: string
  priceTime: string
  whereYouAre: string
  whatYouGet: string
  badges: string[]
  cta: string
}

export const SERVICE_STAGE_DEFS: readonly ServiceStageDef[] = STAGE_ORDER.map((id) => ({ id }))
