// Order only; copy lives in i18n under home.stack.groups.<id>.
export const STACK_GROUP_IDS = ['frontend', 'backend', 'infra', 'ai'] as const
export type StackGroupId = (typeof STACK_GROUP_IDS)[number]

// Lucide names for @nuxt/icon; nuxt.config.ts adds them to the client bundle.
export const STACK_GROUP_ICONS: Record<StackGroupId, string> = {
  frontend: 'lucide:layout-grid',
  backend: 'lucide:database',
  infra: 'lucide:cloud',
  ai: 'lucide:sparkles',
}

export interface StackGroup {
  id: StackGroupId
  name: string
  /** "Lead: sentence." — split on the first colon. */
  benefit: string
  tags: string[]
  icon: string
}
