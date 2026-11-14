// What the visitor has typed into the contact form. It outlives the form component (the dialog
// unmounts it on close) and is cleared only after a successful send. The service chip is not part
// of it: each opening pre-selects the service of the page it was opened from.
export interface ContactDraft {
  name: string
  email: string
  company: string
  message: string
  budget: string
  source: string
}

export function emptyContactDraft(): ContactDraft {
  return { name: '', email: '', company: '', message: '', budget: '', source: '' }
}

// The optional fields sit behind "+ Detalii"; a draft that filled any of them reopens with it expanded.
export function hasContactDetails(draft: ContactDraft): boolean {
  return Boolean(draft.company || draft.budget || draft.source)
}
