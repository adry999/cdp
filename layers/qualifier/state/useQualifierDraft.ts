import { emptyQualifierDraft, type QualifierDraft } from '#layers/qualifier/domain/draft'

// The flow's answers live in useState, not in the modal: closing the dialog unmounts its steps,
// and the next opening (from any button on any page) picks up where the visitor left.
export function useQualifierDraft() {
  const draft = useState<QualifierDraft>('qualifier:draft', emptyQualifierDraft)

  // Mutates in place, so anything bound to `draft.value.contact` keeps pointing at it.
  function clear() {
    const empty = emptyQualifierDraft()
    Object.assign(draft.value.contact, empty.contact)
    draft.value.step = empty.step
    draft.value.stage = empty.stage
    draft.value.budget = empty.budget
  }

  return { draft, clear }
}
