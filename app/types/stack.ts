import type { StackIconName } from '~/components/site/StackGroupIcon.vue'

/**
 * Structural definition of the homepage "Stack" section (section 02,
 * HomeStack.vue): four capability groups, in display order, each mapping a
 * group id to its card icon.
 *
 * ALL card copy — group name, the one-line business benefit and the tech tags —
 * lives in ONE place:
 *
 *     i18n/locales/{ro,en}.json  →  home.stack.groups.<id>
 *
 * Edit or add entries there. This file only owns group order + icon wiring; it
 * holds no text. See useStackGroups() for how the two are joined.
 *
 * The DB `stack_groups` table and /admin still exist but no longer feed the
 * homepage (same split as the services timeline).
 */
export type StackGroupId = 'frontend' | 'backend' | 'infra' | 'ai'

export interface StackGroupDef {
  /** Keys the i18n copy and the card. */
  id: StackGroupId
  /** Inlined Lucide glyph — must stay in sync with StackGroupIcon.vue. */
  icon: StackIconName
}

/** A capability group with its `home.stack.groups.<id>` copy resolved. */
export interface StackGroup extends StackGroupDef {
  /** Group name, e.g. "Frontend & UI". */
  name: string
  /** One-line business benefit, "Lead: sentence." — the lead is split on the first colon. */
  benefit: string
  /** Tech pills. */
  tags: string[]
}

/** Ordered client-facing surface first, deepest infrastructure last. */
export const STACK_GROUP_DEFS: readonly StackGroupDef[] = [
  { id: 'frontend', icon: 'layout-grid' },
  { id: 'backend', icon: 'database' },
  { id: 'infra', icon: 'cloud' },
  { id: 'ai', icon: 'sparkles' },
] as const
