import { cardSource } from '#layers/card/domain/cardProfile'

/** What /c records: the visit, then each button. Same list as the check in the card_events migration. */
export const CARD_EVENT_KINDS = ['view', 'save', 'whatsapp', 'telegram', 'budget'] as const
export type CardEventKind = (typeof CARD_EVENT_KINDS)[number]

export function isCardEventKind(value: unknown): value is CardEventKind {
  return typeof value === 'string' && (CARD_EVENT_KINDS as readonly string[]).includes(value)
}

export interface CardEvent {
  slug: string
  kind: CardEventKind
  source: string | null
}

export interface RawCardEvent {
  slug?: unknown
  kind?: unknown
  source?: unknown
}

/** A valid event for a card that exists, or null: nothing a visitor types reaches the table unchecked. */
export function parseCardEvent(raw: RawCardEvent, knownSlugs: readonly string[]): CardEvent | null {
  if (typeof raw.slug !== 'string' || !knownSlugs.includes(raw.slug)) return null
  if (!isCardEventKind(raw.kind)) return null
  return { slug: raw.slug, kind: raw.kind, source: cardSource(raw.source) ?? null }
}

/** Fixed-window counter per key. In memory: each Hostinger app is one long-lived Node process. */
export function createWindowLimiter(options: { max: number; windowMs: number; now?: () => number }) {
  const now = options.now ?? Date.now
  const windows = new Map<string, { start: number; hits: number }>()
  return {
    /** Counts a hit for `key`; false once the key is over `max` in the current window. */
    hit(key: string): boolean {
      const time = now()
      const current = windows.get(key)
      if (!current || time - current.start >= options.windowMs) {
        // Expired windows go on the next new key, so the map holds only recent visitors.
        if (!current) for (const [k, w] of windows) if (time - w.start >= options.windowMs) windows.delete(k)
        windows.set(key, { start: time, hits: 1 })
        return true
      }
      current.hits += 1
      return current.hits <= options.max
    },
  }
}
