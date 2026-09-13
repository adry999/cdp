export const STAGE_IDS = ['A', 'B', 'C', 'D', 'E'] as const
export type StageId = (typeof STAGE_IDS)[number]

// Display order is lightest engagement first; the ids themselves stay canonical.
export const STAGE_ORDER = ['E', 'B', 'A', 'C', 'D'] as const satisfies readonly StageId[]

export type StageIconName = 'file-text' | 'lightbulb' | 'shapes' | 'gauge' | 'bot'

export const STAGE_ICONS: Record<StageId, StageIconName> = {
  A: 'shapes',
  B: 'lightbulb',
  C: 'gauge',
  D: 'bot',
  E: 'file-text',
}

export function isStageId(value: unknown): value is StageId {
  return typeof value === 'string' && (STAGE_IDS as readonly string[]).includes(value)
}
