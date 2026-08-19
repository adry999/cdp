export interface ProjectFactRow {
  label_ro: string
  label_en: string | null
  value_ro: string
  value_en: string | null
  sort_order: number
}
export interface ProjectStepRow {
  title_ro: string
  title_en: string | null
  body_ro: string
  body_en: string | null
  sort_order: number
}
export interface ProjectStatRow {
  value: string
  label_ro: string
  label_en: string | null
  sort_order: number
}
export interface ProjectImageRow {
  path: string | null
  alt_ro: string
  alt_en: string | null
  aspect: string
  sort_order: number
}

export interface ProjectRow {
  slug_ro: string
  slug_en: string | null
  title_ro: string
  title_en: string | null
  card_title_ro: string
  card_title_en: string | null
  summary_ro: string
  summary_en: string | null
  lead_ro: string
  lead_en: string | null
  year: number | null
  tech: string[]
  cover_path: string | null
  cover_alt_ro: string | null
  cover_alt_en: string | null
  hero_path: string | null
  hero_alt_ro: string | null
  hero_alt_en: string | null
  context_heading_ro: string | null
  context_heading_en: string | null
  context_body_ro: string | null
  context_body_en: string | null
  solution_heading_ro: string | null
  solution_heading_en: string | null
  quote_ro: string | null
  quote_en: string | null
  quote_author: string | null
  quote_role_ro: string | null
  quote_role_en: string | null
  quote_company: string | null
  next_title_ro: string | null
  next_title_en: string | null
  sort_order: number
  project_facts: ProjectFactRow[]
  project_steps: ProjectStepRow[]
  project_stats: ProjectStatRow[]
  project_images: ProjectImageRow[]
}

type Locale = 'ro' | 'en'

function pick(ro: string, en: string | null | undefined, locale: Locale): string {
  return locale === 'en' && en ? en : ro
}

export function mapProject(row: ProjectRow, locale: Locale) {
  const slug = (locale === 'en' && row.slug_en) || row.slug_ro

  const attribution =
    row.quote_author || row.quote_role_ro || row.quote_company
      ? [row.quote_author, pick(row.quote_role_ro ?? '', row.quote_role_en, locale), row.quote_company]
          .filter(Boolean)
          .join(', ')
      : locale === 'en'
        ? '[ Name ], [ role ], [ company ]'
        : '[ Nume ], [ funcție ], [ companie ]'

  return {
    slug,
    tech: row.tech,
    title: pick(row.card_title_ro, row.card_title_en, locale),
    text: pick(row.summary_ro, row.summary_en, locale),
    thumbnailLabel: `[ ${pick(row.cover_alt_ro ?? row.card_title_ro, row.cover_alt_en, locale)} ]`,
    coverPath: row.cover_path,
    caseStudy: {
      tech: row.tech,
      year: row.year != null ? String(row.year) : '',
      heroTitle: pick(row.title_ro, row.title_en, locale),
      heroLead: pick(row.lead_ro, row.lead_en, locale),
      mainScreenshotLabel: `[ ${pick(row.hero_alt_ro ?? row.title_ro, row.hero_alt_en, locale)} ]`,
      heroPath: row.hero_path,
      facts: [...row.project_facts]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((f) => ({ label: pick(f.label_ro, f.label_en, locale), value: pick(f.value_ro, f.value_en, locale) })),
      contextTitle: pick(row.context_heading_ro ?? '', row.context_heading_en, locale),
      contextParagraphs: pick(row.context_body_ro ?? '', row.context_body_en, locale)
        .split(/\n\s*\n/)
        .filter(Boolean),
      solutionTitle: pick(row.solution_heading_ro ?? '', row.solution_heading_en, locale),
      steps: [...row.project_steps]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((s, i) => ({
          number: String(i + 1).padStart(2, '0'),
          title: pick(s.title_ro, s.title_en, locale),
          text: pick(s.body_ro, s.body_en, locale),
        })),
      gallery: [...row.project_images]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((img) => `[ ${pick(img.alt_ro, img.alt_en, locale)} ]`),
      galleryPaths: [...row.project_images].sort((a, b) => a.sort_order - b.sort_order).map((img) => img.path),
      resultStats: [...row.project_stats]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((s) => ({ value: s.value, label: pick(s.label_ro, s.label_en, locale) })),
      quote: pick(row.quote_ro ?? '', row.quote_en, locale),
      attribution,
      nextTitle: pick(row.next_title_ro ?? '', row.next_title_en, locale),
    },
  }
}

export type MappedProject = ReturnType<typeof mapProject>
