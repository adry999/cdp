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

export const LINK_KINDS = ['live', 'preview', 'figma', 'walkthrough'] as const
export type LinkKind = (typeof LINK_KINDS)[number]

/** A titled list entry (adapt, delivered): „Backup automat” · „Copii pe zile și luni”. */
export type CasePair = StarConstraint

export interface CaseAdapt {
  heading: string
  body: string
  modules: CasePair[]
  integrations: CasePair[]
  safety: CasePair[]
}

export interface CaseDelivered {
  label: string
  items: CasePair[]
}

export interface CaseFaqItem {
  q: string
  a: string
}

export interface CaseFaq {
  heading: string
  items: CaseFaqItem[]
}

export interface CaseGalleryHeading {
  heading: string
  note: string
}

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

/** Null unless the section has a paragraph, modules, integrations or safety items (a heading alone shows nothing). */
export function toAdapt(value: Json | null | undefined): CaseAdapt | null {
  if (!isObject(value ?? undefined)) return null
  const obj = value as JsonObject
  const adapt = {
    heading: text(obj.heading),
    body: text(obj.body),
    modules: toConstraints(obj.modules ?? null),
    integrations: toConstraints(obj.integrations ?? null),
    safety: toConstraints(obj.safety ?? null),
  }
  return adapt.body || adapt.modules.length || adapt.integrations.length || adapt.safety.length ? adapt : null
}

export function toDelivered(value: Json | null | undefined): CaseDelivered | null {
  if (!isObject(value ?? undefined)) return null
  const obj = value as JsonObject
  const items = toConstraints(obj.items ?? null)
  return items.length ? { label: text(obj.label), items } : null
}

/** Only entries with both a question and an answer; null without any. */
export function toFaq(value: Json | null | undefined): CaseFaq | null {
  if (!isObject(value ?? undefined)) return null
  const obj = value as JsonObject
  const items = list(obj.items ?? null)
    .filter(isObject)
    .map((item) => ({ q: text(item.q), a: text(item.a) }))
    .filter((item) => item.q && item.a)
  return items.length ? { heading: text(obj.heading), items } : null
}

export function toGalleryHeading(value: Json | null | undefined): CaseGalleryHeading | null {
  if (!isObject(value ?? undefined)) return null
  const obj = value as JsonObject
  const gallery = { heading: text(obj.heading), note: text(obj.note) }
  return gallery.heading || gallery.note ? gallery : null
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

export function isExternalLink(url: string): boolean {
  return /^https?:\/\//.test(url)
}

/** Absolute http(s) for every kind; a walkthrough may also point inside the site ("/#contact"). */
export function isLinkUrl(kind: LinkKind, url: string): boolean {
  if (isExternalLink(url)) return true
  return kind === 'walkthrough' && /^\/(?!\/)/.test(url)
}

export function toLinks(value: Json | null | undefined): ProjectLinkRow[] {
  return list(value)
    .filter(isObject)
    .flatMap((item): ProjectLinkRow[] => {
      const url = text(item.url)
      if (!isLinkKind(item.kind) || !isLinkUrl(item.kind, url)) return []
      return [{ kind: item.kind, url, note_ro: text(item.note_ro) || null, note_en: text(item.note_en) || null }]
    })
}

/**
 * The parsed English column when it yields content, otherwise the parsed Romanian
 * one (same rule as `pick`). Decided after parsing, so an English column holding
 * only blank entries falls back instead of hiding the block.
 */
export function pickJson<T>(
  ro: Json | null,
  en: Json | null,
  locale: string,
  parse: (value: Json | null) => T,
): T {
  if (locale === 'en') {
    const parsed = parse(en)
    if (parsed !== null && !(Array.isArray(parsed) && parsed.length === 0)) return parsed
  }
  return parse(ro)
}
