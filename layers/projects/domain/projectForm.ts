import type { Json } from '#layers/core/shared/types/database.types'
import { usableGallery, type ProjectImageInput } from '#layers/projects/domain/projectPayload'
import type { AdminProjectRow } from '#layers/projects/domain/projectSelect'

export interface Bilingual {
  ro: string
  en: string
}

export interface FactForm {
  label: Bilingual
  value: Bilingual
}

export interface StackItemForm {
  name: string
  role: Bilingual
}

export interface StatForm {
  value: string
  label: Bilingual
}

export interface ProjectForm {
  slugRo: string
  slugEn: string
  title: Bilingual
  cardTitle: Bilingual
  summary: Bilingual
  lead: Bilingual
  year: string
  tech: string[]
  techInput: string
  serviceTag: string | null
  kind: Bilingual
  tags: Bilingual
  liveUrl: string
  liveUrlLabel: Bilingual
  coverPath: string | null
  coverAlt: Bilingual
  heroPath: string | null
  heroAlt: Bilingual
  gallery: ProjectImageInput[]
  facts: FactForm[]
  contextBody: Bilingual
  solutionBody: Bilingual
  stack: StackItemForm[]
  obstaclesBody: Bilingual
  changesBody: Bilingual
  resultBody: Bilingual
  screensDemo: boolean
  stats: StatForm[]
  quote: Bilingual
  quoteAuthor: string
  quoteRole: Bilingual
  quoteCompany: string
  published: boolean
  featured: boolean
}

export const DEFAULT_FACTS: AdminProjectRow['project_facts'] = [
  { label_ro: 'Client', label_en: 'Client', value_ro: '', value_en: '', sort_order: 0 },
  { label_ro: 'Durată', label_en: 'Duration', value_ro: '', value_en: '', sort_order: 1 },
  { label_ro: 'Echipă', label_en: 'Team', value_ro: '', value_en: '', sort_order: 2 },
  { label_ro: 'Utilizatori', label_en: 'Users', value_ro: '', value_en: '', sort_order: 3 },
]

export const MAX_STATS = 4

export function emptyBilingual(): Bilingual {
  return { ro: '', en: '' }
}

function bilingual(ro: string | null, en: string | null): Bilingual {
  return { ro: ro ?? '', en: en ?? '' }
}

/** A blank form for a new project, or the editable copy of a loaded row. */
export function toProjectForm(row: AdminProjectRow | null): ProjectForm {
  return {
    slugRo: row?.slug_ro ?? '',
    slugEn: row?.slug_en ?? row?.slug_ro ?? '',
    title: bilingual(row?.title_ro ?? null, row?.title_en ?? null),
    cardTitle: bilingual(row?.card_title_ro ?? null, row?.card_title_en ?? null),
    summary: bilingual(row?.summary_ro ?? null, row?.summary_en ?? null),
    lead: bilingual(row?.lead_ro ?? null, row?.lead_en ?? null),
    year: row?.year != null ? String(row.year) : '2026',
    tech: [...(row?.tech ?? [])],
    techInput: '',
    serviceTag: row?.service_tag ?? null,
    kind: bilingual(row?.kind_ro ?? null, row?.kind_en ?? null),
    tags: { ro: (row?.tags_ro ?? []).join(', '), en: (row?.tags_en ?? []).join(', ') },
    liveUrl: row?.live_url ?? '',
    liveUrlLabel: bilingual(row?.live_url_label_ro ?? null, row?.live_url_label_en ?? null),

    coverPath: row?.cover_path ?? null,
    coverAlt: bilingual(row?.cover_alt_ro ?? null, row?.cover_alt_en ?? null),
    heroPath: row?.hero_path ?? null,
    heroAlt: bilingual(row?.hero_alt_ro ?? null, row?.hero_alt_en ?? null),
    // Blank slots are UI-only scaffolding for the "add image" flow — never written as
    // project_images rows (a NOT NULL path of '' renders a broken <img> on the public site).
    // toSavePayload() strips them again through usableGallery().
    gallery: (row?.project_images ?? [])
      .filter((img) => img.path)
      .map((img) => ({ path: img.path, altRo: img.alt_ro, altEn: img.alt_en ?? '', aspect: img.aspect })),

    facts: (row?.project_facts.length ? row.project_facts : DEFAULT_FACTS).map((fact) => ({
      label: bilingual(fact.label_ro, fact.label_en),
      value: bilingual(fact.value_ro, fact.value_en),
    })),

    contextBody: bilingual(row?.context_body_ro ?? null, row?.context_body_en ?? null),
    solutionBody: bilingual(row?.solution_body_ro ?? null, row?.solution_body_en ?? null),
    stack: (row?.project_stack ?? []).map((item) => ({ name: item.name, role: bilingual(item.role_ro, item.role_en) })),
    obstaclesBody: bilingual(row?.obstacles_body_ro ?? null, row?.obstacles_body_en ?? null),
    changesBody: bilingual(row?.changes_body_ro ?? null, row?.changes_body_en ?? null),
    resultBody: bilingual(row?.result_body_ro ?? null, row?.result_body_en ?? null),
    screensDemo: row?.screens_demo ?? false,

    stats: (row?.project_stats ?? []).map((stat) => ({ value: stat.value, label: bilingual(stat.label_ro, stat.label_en) })),
    quote: bilingual(row?.quote_ro ?? null, row?.quote_en ?? null),
    quoteAuthor: row?.quote_author ?? '',
    quoteRole: bilingual(row?.quote_role_ro ?? null, row?.quote_role_en ?? null),
    quoteCompany: row?.quote_company ?? '',

    published: !!row?.published_at,
    featured: row?.featured ?? false,
  }
}

// Comma-separated editor input -> text[] column.
function splitTags(input: string): string[] {
  return input
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

type SavePayload = { [key: string]: Json }

/** The argument of the `save_project` RPC; an empty English field is stored as null. */
export function toSavePayload(form: ProjectForm, projectId: string | null): SavePayload {
  return {
    id: projectId,
    slug_ro: form.slugRo.trim(),
    slug_en: form.slugEn.trim() || form.slugRo.trim(),
    published: form.published,
    title_ro: form.title.ro,
    title_en: form.title.en || null,
    card_title_ro: form.cardTitle.ro,
    card_title_en: form.cardTitle.en || null,
    summary_ro: form.summary.ro,
    summary_en: form.summary.en || null,
    lead_ro: form.lead.ro,
    lead_en: form.lead.en || null,
    year: form.year ? Number(form.year) : null,
    tech: form.tech,
    service_tag: form.serviceTag || null,
    featured: form.featured,
    cover_path: form.coverPath,
    cover_alt_ro: form.coverAlt.ro || null,
    cover_alt_en: form.coverAlt.en || null,
    hero_path: form.heroPath,
    hero_alt_ro: form.heroAlt.ro || null,
    hero_alt_en: form.heroAlt.en || null,
    kind_ro: form.kind.ro || null,
    kind_en: form.kind.en || null,
    tags_ro: splitTags(form.tags.ro),
    tags_en: splitTags(form.tags.en),
    live_url: form.liveUrl.trim() || null,
    live_url_label_ro: form.liveUrlLabel.ro || null,
    live_url_label_en: form.liveUrlLabel.en || null,
    screens_demo: form.screensDemo,
    context_body_ro: form.contextBody.ro || null,
    context_body_en: form.contextBody.en || null,
    solution_body_ro: form.solutionBody.ro || null,
    solution_body_en: form.solutionBody.en || null,
    obstacles_body_ro: form.obstaclesBody.ro || null,
    obstacles_body_en: form.obstaclesBody.en || null,
    changes_body_ro: form.changesBody.ro || null,
    changes_body_en: form.changesBody.en || null,
    result_body_ro: form.resultBody.ro || null,
    result_body_en: form.resultBody.en || null,
    quote_ro: form.quote.ro || null,
    quote_en: form.quote.en || null,
    quote_author: form.quoteAuthor || null,
    quote_role_ro: form.quoteRole.ro || null,
    quote_role_en: form.quoteRole.en || null,
    quote_company: form.quoteCompany || null,
    sort_order: null,
    facts: form.facts.map((fact) => ({
      label_ro: fact.label.ro,
      label_en: fact.label.en || null,
      value_ro: fact.value.ro,
      value_en: fact.value.en || null,
    })),
    stack: form.stack
      .filter((item) => item.name.trim())
      .map((item) => ({
        name: item.name.trim(),
        role_ro: item.role.ro,
        role_en: item.role.en || null,
      })),
    stats: form.stats.map((stat) => ({
      value: stat.value,
      label_ro: stat.label.ro,
      label_en: stat.label.en || null,
    })),
    images: usableGallery(form.gallery).map((img) => ({
      path: img.path,
      alt_ro: img.altRo || null,
      alt_en: img.altEn || null,
      aspect: img.aspect,
    })),
  }
}

/** Media URLs the loaded project referenced that the edited form no longer does. */
export function replacedMediaUrls(row: AdminProjectRow | null, form: ProjectForm): string[] {
  if (!row) return []
  const before = [row.cover_path, row.hero_path, ...row.project_images.map((img) => img.path)]
  const after = new Set([form.coverPath, form.heroPath, ...form.gallery.map((img) => img.path)])
  return before.filter((url): url is string => !!url && !after.has(url))
}
