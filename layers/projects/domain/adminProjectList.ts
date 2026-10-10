import type { AdminProjectListRow } from '#layers/projects/domain/projectSelect'

export type ProjectsAdminFilter = 'toate' | 'draft' | 'publicate'

export const PROJECTS_ADMIN_FILTERS: readonly ProjectsAdminFilter[] = ['toate', 'draft', 'publicate']

export function isDraft(row: Pick<AdminProjectListRow, 'published_at'>): boolean {
  return !row.published_at
}

export function filterProjects<T extends Pick<AdminProjectListRow, 'published_at'>>(
  rows: readonly T[],
  filter: ProjectsAdminFilter,
): T[] {
  if (filter === 'draft') return rows.filter(isDraft)
  if (filter === 'publicate') return rows.filter((row) => !isDraft(row))
  return [...rows]
}

export function filterCounts(rows: readonly Pick<AdminProjectListRow, 'published_at'>[]): Record<ProjectsAdminFilter, number> {
  const drafts = rows.filter(isDraft).length
  return { toate: rows.length, draft: drafts, publicate: rows.length - drafts }
}

/** Target index for the keyboard up/down buttons, or `null` at the edge of the list. */
export function neighborIndex(index: number, direction: 'up' | 'down', length: number): number | null {
  const target = direction === 'up' ? index - 1 : index + 1
  return target < 0 || target >= length ? null : target
}

/**
 * First free `<slug>-copie`, `<slug>-copie-2`, … Checked against every slug in use (RO and EN):
 * the copy takes the same value in both columns, and either column can collide.
 */
export function nextCopySlug(slug: string, taken: ReadonlySet<string>): string {
  let candidate = `${slug}-copie`
  let n = 2
  while (taken.has(candidate)) candidate = `${slug}-copie-${n++}`
  return candidate
}

export type ChecklistItemId = 'content' | 'screenshots' | 'consent' | 'live' | 'figures' | 'quote'

export interface ChecklistItem {
  id: ChecklistItemId
  label: string
  hint: string
  required: boolean
  done: boolean
}

export interface PublishChecklist {
  items: ChecklistItem[]
  /** Every required item is done. */
  canPublish: boolean
  /** Screenshots are placeholder data, not the client's real screens. */
  demoScreens: boolean
}

const filled = (value: string | null | undefined) => !!value?.trim()

/**
 * The pre-publish checklist for a draft. `consentConfirmed` is passed in because no column
 * stores the client's consent: the admin confirms it by hand each time.
 */
export function evaluateChecklist(row: AdminProjectListRow, consentConfirmed: boolean): PublishChecklist {
  const items: ChecklistItem[] = [
    {
      id: 'content',
      label: 'Text obligatoriu (RO)',
      hint: 'Titlu, titlu card, descriere, lead și problema — fără ele baza de date refuză publicarea.',
      required: true,
      done:
        filled(row.title_ro) &&
        filled(row.card_title_ro) &&
        filled(row.summary_ro) &&
        filled(row.lead_ro) &&
        filled(row.context_body_ro),
    },
    {
      id: 'screenshots',
      label: 'Capturi încărcate',
      hint: 'Cel puțin o copertă sau o imagine în galerie.',
      required: true,
      done: filled(row.cover_path) || row.project_images.some((image) => filled(image.path)),
    },
    {
      id: 'consent',
      label: 'Nume client și acord',
      hint: 'Confirmat manual: clientul a acceptat să fie numit și să apară public.',
      required: true,
      done: consentConfirmed,
    },
    {
      id: 'live',
      label: 'Link live',
      hint: 'Adresa site-ului sau a aplicației, din secțiunea Linkuri.',
      required: true,
      done: filled(row.live_url),
    },
    {
      id: 'figures',
      label: 'Cifre de rezultat',
      hint: 'Opțional. Doar cifre furnizate de client.',
      required: false,
      done: row.project_stats.length > 0 || filled(row.win_value_ro),
    },
    {
      id: 'quote',
      label: 'Citat',
      hint: 'Opțional. Doar cu acordul autorului.',
      required: false,
      done: filled(row.quote_ro),
    },
  ]
  return {
    items,
    canPublish: items.every((item) => !item.required || item.done),
    demoScreens: row.screens_demo,
  }
}
