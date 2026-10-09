import type { Json } from '#layers/core/shared/types/database.types'
import { pick } from '#layers/core/shared/utils/pick'
import { isServiceTagId } from '#layers/core/shared/types/service-tag'
import { pickJson, toConstraints, toFigures, toLinks, toStrings } from '#layers/projects/domain/star'

export interface ProjectFactRow {
  label_ro: string
  label_en: string | null
  value_ro: string
  value_en: string | null
  sort_order: number
}
export interface ProjectStackRow {
  name: string
  role_ro: string
  role_en: string | null
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

export interface ProjectCardRow {
  slug_ro: string
  slug_en: string | null
  card_title_ro: string
  card_title_en: string | null
  summary_ro: string
  summary_en: string | null
  kind_ro: string | null
  kind_en: string | null
  tech: string[]
  service_tag: string | null
  featured: boolean
  cover_path: string | null
  cover_alt_ro: string | null
  cover_alt_en: string | null
  win_value_ro: string | null
  win_value_en: string | null
  win_label_ro: string | null
  win_label_en: string | null
  sort_order: number
}

export interface ProjectRow extends ProjectCardRow {
  title_ro: string
  title_en: string | null
  lead_ro: string
  lead_en: string | null
  year: number | null
  hero_path: string | null
  hero_alt_ro: string | null
  hero_alt_en: string | null
  tags_ro: string[]
  tags_en: string[]
  links: Json
  screens_demo: boolean
  context_body_ro: string | null
  context_body_en: string | null
  solution_body_ro: string | null
  solution_body_en: string | null
  obstacles_body_ro: string | null
  obstacles_body_en: string | null
  changes_body_ro: string | null
  changes_body_en: string | null
  result_body_ro: string | null
  result_body_en: string | null
  quote_ro: string | null
  quote_en: string | null
  quote_author: string | null
  quote_role_ro: string | null
  quote_role_en: string | null
  quote_company: string | null
  star_cost_ro: Json | null
  star_cost_en: Json | null
  star_goal_ro: string | null
  star_goal_en: string | null
  star_constraints_ro: Json | null
  star_constraints_en: Json | null
  star_biz_ro: Json | null
  star_biz_en: Json | null
  star_incident_ro: Json | null
  star_incident_en: Json | null
  star_gains_ro: Json | null
  star_gains_en: Json | null
  star_savings_ro: Json | null
  star_savings_en: Json | null
  project_facts: ProjectFactRow[]
  project_stack: ProjectStackRow[]
  project_stats: ProjectStatRow[]
  project_images: ProjectImageRow[]
}

type Locale = 'ro' | 'en'

function paragraphs(ro: string | null, en: string | null, locale: Locale): string[] {
  return pick(ro ?? '', en, locale)
    .split(/\n\s*\n/)
    .filter((p) => p.trim())
}

export function mapProjectCard(row: ProjectCardRow, locale: Locale) {
  const winValue = pick(row.win_value_ro?.trim() ?? '', row.win_value_en?.trim(), locale)
  const winLabel = pick(row.win_label_ro?.trim() ?? '', row.win_label_en?.trim(), locale)
  return {
    slug: (locale === 'en' && row.slug_en) || row.slug_ro,
    kind: pick(row.kind_ro ?? '', row.kind_en, locale),
    tech: row.tech,
    title: pick(row.card_title_ro, row.card_title_en, locale),
    text: pick(row.summary_ro, row.summary_en, locale),
    // *Label captions the placeholder frame; *Alt is the real <img alt> text.
    thumbnailLabel: `[ ${pick(row.cover_alt_ro ?? row.card_title_ro, row.cover_alt_en, locale)} ]`,
    coverAlt: pick(row.cover_alt_ro ?? row.card_title_ro, row.cover_alt_en, locale),
    coverPath: row.cover_path,
    serviceTag: isServiceTagId(row.service_tag) ? row.service_tag : null,
    featured: row.featured,
    // The short card result; hidden unless the value is set.
    win: winValue ? { value: winValue, label: winLabel } : null,
  }
}

export type MappedProjectCard = ReturnType<typeof mapProjectCard>

export function mapProject(row: ProjectRow, locale: Locale) {
  const galleryImages = [...row.project_images]
    .filter((img) => !!img.path?.trim())
    .sort((a, b) => a.sort_order - b.sort_order)

  const attribution =
    row.quote_author || row.quote_role_ro || row.quote_company
      ? [row.quote_author, pick(row.quote_role_ro ?? '', row.quote_role_en, locale), row.quote_company]
          .filter(Boolean)
          .join(', ')
      : locale === 'en'
        ? '[ Name ], [ role ], [ company ]'
        : '[ Nume ], [ funcție ], [ companie ]'

  return {
    ...mapProjectCard(row, locale),
    caseStudy: {
      tech: row.tech,
      year: row.year != null ? String(row.year) : '',
      heroTitle: pick(row.title_ro, row.title_en, locale),
      heroLead: pick(row.lead_ro, row.lead_en, locale),
      mainScreenshotLabel: `[ ${pick(row.hero_alt_ro ?? row.title_ro, row.hero_alt_en, locale)} ]`,
      heroAlt: pick(row.hero_alt_ro ?? row.title_ro, row.hero_alt_en, locale),
      heroPath: row.hero_path,
      facts: [...row.project_facts]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((f) => ({ label: pick(f.label_ro, f.label_en, locale), value: pick(f.value_ro, f.value_en, locale) })),
      tags: locale === 'en' ? row.tags_en : row.tags_ro,
      links: toLinks(row.links).map((link) => ({
        kind: link.kind,
        url: link.url,
        note: pick(link.note_ro ?? '', link.note_en, locale),
      })),
      star: {
        cost: pickJson(row.star_cost_ro, row.star_cost_en, locale, toFigures),
        goal: pick(row.star_goal_ro?.trim() ?? '', row.star_goal_en?.trim(), locale),
        constraints: pickJson(row.star_constraints_ro, row.star_constraints_en, locale, toConstraints),
        biz: pickJson(row.star_biz_ro, row.star_biz_en, locale, toStrings),
        gains: pickJson(row.star_gains_ro, row.star_gains_en, locale, toFigures),
        savings: pickJson(row.star_savings_ro, row.star_savings_en, locale, toFigures),
      },
      // Every real screenshot once, hero first, for the 06 grid and the lightbox.
      shots: [
        ...(row.hero_path ? [{ path: row.hero_path, alt: pick(row.hero_alt_ro ?? row.title_ro, row.hero_alt_en, locale) }] : []),
        ...galleryImages.map((img) => ({ path: img.path as string, alt: pick(img.alt_ro, img.alt_en, locale) })),
      ].filter((shot, i, all) => all.findIndex((other) => other.path === shot.path) === i),
      problemParagraphs: paragraphs(row.context_body_ro, row.context_body_en, locale),
      solutionParagraphs: paragraphs(row.solution_body_ro, row.solution_body_en, locale),
      stack: [...row.project_stack]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((s) => ({ name: s.name, role: pick(s.role_ro, s.role_en, locale) })),
      resultParagraphs: paragraphs(row.result_body_ro, row.result_body_en, locale),
      screensDemo: row.screens_demo,
      quote: pick(row.quote_ro ?? '', row.quote_en, locale),
      attribution,
    },
  }
}

export type MappedProject = ReturnType<typeof mapProject>
