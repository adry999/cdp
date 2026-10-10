export const SERVICE_TAG_IDS = ['website', 'web-app', 'wordpress', 'shopify', 'ai-automation', 'granturi'] as const
export type ServiceTagId = (typeof SERVICE_TAG_IDS)[number]

export function isServiceTagId(value: unknown): value is ServiceTagId {
  return typeof value === 'string' && (SERVICE_TAG_IDS as readonly string[]).includes(value)
}

// The admin is Romanian-only, so it labels services with these. The public site takes the
// localized names from `SERVICE_LINKS` (services) and the i18n files.
export const SERVICE_TAG_LABELS_RO: Readonly<Record<ServiceTagId, string>> = {
  website: 'Website',
  'web-app': 'Aplicație web',
  wordpress: 'WordPress',
  shopify: 'Shopify',
  'ai-automation': 'Automatizare cu AI',
  granturi: 'Proiecte finanțate prin granturi',
}
