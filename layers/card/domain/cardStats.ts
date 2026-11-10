import { CARD_EVENT_KINDS, isCardEventKind, type CardEventKind } from '#layers/card/domain/cardEvents'

export type CardCounts = Record<CardEventKind, number>

export interface CardStatsRow {
  slug: string
  name: string
  counts: CardCounts
}

export interface CardEventCountRow {
  card_slug: string
  kind: string
  total: number
}

function emptyCounts(): CardCounts {
  return Object.fromEntries(CARD_EVENT_KINDS.map((kind) => [kind, 0])) as CardCounts
}

/** One row per card, in team order, zeros where nothing happened; counts for a removed card are kept at the end. */
export function summarizeCardEvents(
  rows: readonly CardEventCountRow[],
  cards: readonly { slug: string; name: string }[],
): CardStatsRow[] {
  const bySlug = new Map<string, CardStatsRow>(cards.map((card) => [card.slug, { ...card, counts: emptyCounts() }]))
  for (const row of rows) {
    if (!isCardEventKind(row.kind)) continue
    let entry = bySlug.get(row.card_slug)
    if (!entry) {
      entry = { slug: row.card_slug, name: row.card_slug, counts: emptyCounts() }
      bySlug.set(row.card_slug, entry)
    }
    entry.counts[row.kind] += Number(row.total)
  }
  return [...bySlug.values()]
}

/**
 * Leads that came from a card: the qualifier stores the page it was opened on (/c, /en/c, /c/<slug>, with
 * an optional ?s=), the contact form the utm_source=qr the /c fallback link adds. PostgREST `or` filter.
 */
export const CARD_LEADS_FILTER = [
  'page.eq./c',
  'page.like./c?*',
  'page.like./c/*',
  'page.eq./en/c',
  'page.like./en/c?*',
  'page.like./en/c/*',
  'utm->>utm_source.eq.qr',
].join(',')
