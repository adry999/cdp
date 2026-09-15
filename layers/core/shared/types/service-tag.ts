export const SERVICE_TAG_IDS = ['website', 'web-app', 'wordpress', 'shopify', 'ai-automation'] as const
export type ServiceTagId = (typeof SERVICE_TAG_IDS)[number]

export function isServiceTagId(value: unknown): value is ServiceTagId {
  return typeof value === 'string' && (SERVICE_TAG_IDS as readonly string[]).includes(value)
}
