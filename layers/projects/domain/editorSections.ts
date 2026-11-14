// The project editor's sections, in page order: each one's heading and the anchor the side list
// links to. Titles carry no numbers: the case study numbers only the sections a project shows
// (`numberSections`), so a fixed "secțiunea 03" here would be wrong for any project that skips one.
export const PROJECT_EDITOR_SECTIONS = [
  { id: 'identitate', title: 'Identitate' },
  { id: 'meniu', title: 'Serviciu și meniu' },
  { id: 'imagini', title: 'Imagini' },
  { id: 'date', title: 'Date' },
  { id: 'situatie', title: 'Situație' },
  { id: 'actiune', title: 'Acțiune' },
  { id: 'tehnic', title: 'Acțiune — tehnic' },
  { id: 'star', title: 'STAR' },
  { id: 'rezultat', title: 'Rezultat și feedback' },
  { id: 'suplimentare', title: 'Secțiuni suplimentare' },
  { id: 'publicare', title: 'Publicare' },
] as const

export type ProjectEditorSectionId = (typeof PROJECT_EDITOR_SECTIONS)[number]['id']

export function projectEditorSectionTitle(id: ProjectEditorSectionId): string {
  return PROJECT_EDITOR_SECTIONS.find((section) => section.id === id)?.title ?? id
}

/** "RO 3 · EN 2" when a list kept per language has a different length in each; `null` when they match. */
export function localeLengthMismatch(ro: readonly unknown[], en: readonly unknown[]): string | null {
  return ro.length === en.length ? null : `RO ${ro.length} · EN ${en.length}`
}
