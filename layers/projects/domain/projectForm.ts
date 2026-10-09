import type { Json } from '#layers/core/shared/types/database.types'
import { usableGallery, type ProjectImageInput } from '#layers/projects/domain/projectPayload'
import type { AdminProjectRow } from '#layers/projects/domain/projectSelect'
import {
  toConstraints,
  toFigures,
  toIncident,
  toLinks,
  toStrings,
  type LinkKind,
  type StarConstraint,
  type StarFigure,
} from '#layers/projects/domain/star'

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

/** RO and EN are separate lists: each locale has its own jsonb column. */
export interface PerLocale<T> {
  ro: T
  en: T
}

export interface IncidentForm {
  found: string
  risk: string
  action: string
  outcome: StarFigure[]
}

export interface LinkForm {
  kind: LinkKind
  url: string
  note: Bilingual
}

export interface StarForm {
  cost: PerLocale<StarFigure[]>
  goal: Bilingual
  constraints: PerLocale<StarConstraint[]>
  biz: PerLocale<string[]>
  incident: PerLocale<IncidentForm>
  gains: PerLocale<StarFigure[]>
  savings: PerLocale<StarFigure[]>
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
  links: LinkForm[]
  winValue: Bilingual
  winLabel: Bilingual
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
  star: StarForm
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

export function emptyIncident(): IncidentForm {
  return { found: '', risk: '', action: '', outcome: [] }
}

function toIncidentForm(value: Json | null | undefined): IncidentForm {
  return toIncident(value) ?? emptyIncident()
}

function toStarForm(row: AdminProjectRow | null): StarForm {
  return {
    cost: { ro: toFigures(row?.star_cost_ro), en: toFigures(row?.star_cost_en) },
    goal: bilingual(row?.star_goal_ro ?? null, row?.star_goal_en ?? null),
    constraints: { ro: toConstraints(row?.star_constraints_ro), en: toConstraints(row?.star_constraints_en) },
    biz: { ro: toStrings(row?.star_biz_ro), en: toStrings(row?.star_biz_en) },
    incident: { ro: toIncidentForm(row?.star_incident_ro), en: toIncidentForm(row?.star_incident_en) },
    gains: { ro: toFigures(row?.star_gains_ro), en: toFigures(row?.star_gains_en) },
    savings: { ro: toFigures(row?.star_savings_ro), en: toFigures(row?.star_savings_en) },
  }
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
    links: toLinks(row?.links).map((link) => ({
      kind: link.kind,
      url: link.url,
      note: bilingual(link.note_ro ?? null, link.note_en ?? null),
    })),
    winValue: bilingual(row?.win_value_ro ?? null, row?.win_value_en ?? null),
    winLabel: bilingual(row?.win_label_ro ?? null, row?.win_label_en ?? null),

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
    star: toStarForm(row),
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

function cleanFigures(items: StarFigure[]): Json {
  const kept = items.map((f) => ({ v: f.v.trim(), k: f.k.trim() })).filter((f) => f.v || f.k)
  return kept.length ? kept : null
}

function cleanConstraints(items: StarConstraint[]): Json {
  const kept = items.map((c) => ({ k: c.k.trim(), v: c.v.trim() })).filter((c) => c.k || c.v)
  return kept.length ? kept : null
}

function cleanStrings(items: string[]): Json {
  const kept = items.map((s) => s.trim()).filter(Boolean)
  return kept.length ? kept : null
}

function cleanIncident(incident: IncidentForm): Json {
  const outcome = cleanFigures(incident.outcome) ?? []
  const found = incident.found.trim()
  const risk = incident.risk.trim()
  const action = incident.action.trim()
  return found || risk || action || (Array.isArray(outcome) && outcome.length) ? { found, risk, action, outcome } : null
}

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
    links: form.links
      .filter((link) => link.url.trim())
      .map((link) => ({
        kind: link.kind,
        url: link.url.trim(),
        note_ro: link.note.ro.trim() || null,
        note_en: link.note.en.trim() || null,
      })),
    win_value_ro: form.winValue.ro.trim() || null,
    win_value_en: form.winValue.en.trim() || null,
    win_label_ro: form.winLabel.ro.trim() || null,
    win_label_en: form.winLabel.en.trim() || null,
    star_cost_ro: cleanFigures(form.star.cost.ro),
    star_cost_en: cleanFigures(form.star.cost.en),
    star_goal_ro: form.star.goal.ro.trim() || null,
    star_goal_en: form.star.goal.en.trim() || null,
    star_constraints_ro: cleanConstraints(form.star.constraints.ro),
    star_constraints_en: cleanConstraints(form.star.constraints.en),
    star_biz_ro: cleanStrings(form.star.biz.ro),
    star_biz_en: cleanStrings(form.star.biz.en),
    star_incident_ro: cleanIncident(form.star.incident.ro),
    star_incident_en: cleanIncident(form.star.incident.en),
    star_gains_ro: cleanFigures(form.star.gains.ro),
    star_gains_en: cleanFigures(form.star.gains.en),
    star_savings_ro: cleanFigures(form.star.savings.ro),
    star_savings_en: cleanFigures(form.star.savings.en),
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
