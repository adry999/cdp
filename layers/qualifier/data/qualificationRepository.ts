import type { StageId } from '#layers/core/shared/types/service-stage'
import { turnstileHeaders } from '#layers/core/shared/utils/turnstile'
import type { QualifierContactPayload } from '#layers/qualifier/domain/qualification'
import type { QualifierBudgetKey } from '#layers/qualifier/domain/routing'

export interface QualificationRequest extends QualifierContactPayload {
  stage: StageId
  budget: QualifierBudgetKey
  lang: string
  page: string
}

export function postQualification(request: QualificationRequest, turnstileToken?: string): Promise<unknown> {
  return $fetch('/api/contact', { method: 'POST', body: request, headers: turnstileHeaders(turnstileToken) })
}
