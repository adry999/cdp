// STAR case-study fields (Situation, Task, Action, Result) and project links. The
// columns are jsonb, edited by hand in the admin, so every reader goes through
// these guards: a malformed entry is dropped rather than breaking the page.
import type { Json } from '#layers/core/shared/types/database.types'

/** A figure with its caption: „−35%” · „pierderi de flori”. */
export interface StarFigure {
  v: string
  k: string
}

/** A task constraint: „Termen” · „10 săptămâni”. */
export interface StarConstraint {
  k: string
  v: string
}

export interface StarIncident {
  found: string
  risk: string
  action: string
  outcome: StarFigure[]
}

export const LINK_KINDS = ['live', 'preview', 'figma'] as const
export type LinkKind = (typeof LINK_KINDS)[number]

/** One element of `projects.links`. */
export interface ProjectLinkRow {
  kind: LinkKind
  url: string
  note_ro?: string | null
  note_en?: string | null
}

type JsonObject = { [key: string]: Json | undefined }

function isObject(value: Json | undefined): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(value: Json | undefined): string {
  return typeof value === 'string' ? value.trim() : ''
}

function list(value: Json | null | undefined): Json[] {
  return Array.isArray(value) ? value : []
}

export function isLinkKind(value: unknown): value is LinkKind {
  return typeof value === 'string' && (LINK_KINDS as readonly string[]).includes(value)
}

export function toFigures(value: Json | null | undefined): StarFigure[] {
  return list(value)
    .filter(isObject)
    .map((item) => ({ v: text(item.v), k: text(item.k) }))
    .filter((item) => item.v || item.k)
}

export function toConstraints(value: Json | null | undefined): StarConstraint[] {
  return list(value)
    .filter(isObject)
    .map((item) => ({ k: text(item.k), v: text(item.v) }))
    .filter((item) => item.k || item.v)
}

export function toStrings(value: Json | null | undefined): string[] {
  return list(value).map(text).filter(Boolean)
}

/** Null unless at least one of found / risk / action / outcome has content. */
export function toIncident(value: Json | null | undefined): StarIncident | null {
  if (!isObject(value ?? undefined)) return null
  const obj = value as JsonObject
  const incident = {
    found: text(obj.found),
    risk: text(obj.risk),
    action: text(obj.action),
    outcome: toFigures(obj.outcome ?? null),
  }
  return incident.found || incident.risk || incident.action || incident.outcome.length ? incident : null
}

export function toLinks(value: Json | null | undefined): ProjectLinkRow[] {
  return list(value)
    .filter(isObject)
    .flatMap((item): ProjectLinkRow[] => {
      const url = text(item.url)
      if (!isLinkKind(item.kind) || !/^https?:\/\//.test(url)) return []
      return [{ kind: item.kind, url, note_ro: text(item.note_ro) || null, note_en: text(item.note_en) || null }]
    })
}

/** The English column when it has content, otherwise the Romanian one (same rule as `pick`). */
export function pickJson(ro: Json | null, en: Json | null, locale: string): Json | null {
  const hasContent = (value: Json | null) =>
    Array.isArray(value) ? value.length > 0 : isObject(value ?? undefined) ? Object.keys(value as JsonObject).length > 0 : false
  return locale === 'en' && hasContent(en) ? en : ro
}
