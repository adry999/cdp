import { parseCardEvent, type CardEvent, type RawCardEvent } from '#layers/card/domain/cardEvents'

export interface RecordCardEventDependencies {
  knownSlugs: readonly string[]
  /** False once the caller is over the limit. */
  allow: () => boolean
  insert: (event: CardEvent) => Promise<void>
}

export type RecordCardEventResult = { outcome: 'invalid' } | { outcome: 'rate_limited' } | { outcome: 'accepted' }

export async function recordCardEvent(raw: RawCardEvent, deps: RecordCardEventDependencies): Promise<RecordCardEventResult> {
  const event = parseCardEvent(raw, deps.knownSlugs)
  if (!event) return { outcome: 'invalid' }
  if (!deps.allow()) return { outcome: 'rate_limited' }
  await deps.insert(event)
  return { outcome: 'accepted' }
}
