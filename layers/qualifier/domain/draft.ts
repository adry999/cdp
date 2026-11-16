import type { StageId } from '#layers/core/shared/types/service-stage'
import type { QualifierContactPayload } from '#layers/qualifier/domain/qualification'
import type { QualifierBudgetKey } from '#layers/qualifier/domain/routing'

// What the visitor has chosen and typed in the qualifier so far. It outlives the dialog (closing
// it, a click on the backdrop included, keeps every answer) and is cleared only after a successful
// send. The honeypot is not part of it.
export type QualifierContactDraft = Omit<QualifierContactPayload, 'website'>

export interface QualifierDraft {
  step: number
  stage: StageId | ''
  budget: QualifierBudgetKey | ''
  contact: QualifierContactDraft
}

export function emptyQualifierDraft(): QualifierDraft {
  return { step: 1, stage: '', budget: '', contact: { name: '', email: '', handle: '', notes: '' } }
}

/**
 * Where the flow resumes when the dialog opens: where the visitor left it, unless the button that
 * opened it names a different stage. Then the flow goes back to step 1 with that stage chosen, so
 * the visitor sees the change; the budget and the contact fields are kept.
 */
export function resumeDraft(draft: QualifierDraft, requestedStage: StageId | ''): QualifierDraft {
  if (!requestedStage || requestedStage === draft.stage) return draft
  return { ...draft, step: 1, stage: requestedStage }
}
