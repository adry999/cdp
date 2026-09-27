// Order only; copy lives in i18n under home.stack.groups.<id>.
export const STACK_GROUP_IDS = ['frontend', 'backend', 'infra', 'ai'] as const
export type StackGroupId = (typeof STACK_GROUP_IDS)[number]

export interface StackGroup {
  id: StackGroupId
  name: string
  /** "Lead: sentence." — HomeStack splits on the first colon. */
  benefit: string
  tags: string[]
}
