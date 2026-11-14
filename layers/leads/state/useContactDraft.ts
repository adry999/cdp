import { emptyContactDraft, type ContactDraft } from '#layers/leads/domain/contactDraft'

// One draft per form layout: the dialog and the inline form (home, /contact) can be on screen
// together and must not mirror each other's typing.
export function useContactDraft(variant: 'page' | 'modal') {
  const draft = useState<ContactDraft>(`leads:contact-draft:${variant}`, emptyContactDraft)

  // Mutates in place so bindings made with toRefs(draft.value) keep pointing at it.
  function clear() {
    Object.assign(draft.value, emptyContactDraft())
  }

  return { draft, clear }
}
