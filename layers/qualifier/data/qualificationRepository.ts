import type { StageId } from '#layers/core/shared/types/service-stage'
import type { QualifierContactPayload } from '#layers/qualifier/domain/qualification'
import type { QualifierBudgetKey } from '#layers/qualifier/domain/routing'

export interface QualificationRequest extends QualifierContactPayload {
  stage: StageId
  budget: QualifierBudgetKey
  lang: string
}

export function postQualification(request: QualificationRequest): Promise<unknown> {
  return $fetch('/api/contact', { method: 'POST', body: request })
}
