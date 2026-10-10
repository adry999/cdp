import { STAGE_ORDER, type StageId } from '#layers/core/shared/types/service-stage'

// Structural defs for the homepage growth timeline; copy lives in i18n under home.services.
export interface ServiceStageDef {
  id: StageId
}

export interface ServiceStage extends ServiceStageDef {
  name: string
  priceTime: string
  whereYouAre: string
  whatYouGet: string
  whyUs: string
  badges: string[]
  cta: string
  pricing: string
  timing: string
  pricingTooltip: string
}

export const SERVICE_STAGE_DEFS: readonly ServiceStageDef[] = STAGE_ORDER.map((id) => ({ id }))
