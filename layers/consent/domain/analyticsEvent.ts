import type { GtagCall } from '#layers/consent/domain/gaInit'

/** Event names the site sends (SEO_SPEC §9). Anything else on the hook is dropped. */
export const ANALYTICS_EVENT_NAMES = ['blog_cta_click', 'blog_toc_click'] as const

const MAX_PARAM_LENGTH = 100

function isEventName(name: unknown): name is (typeof ANALYTICS_EVENT_NAMES)[number] {
  return typeof name === 'string' && (ANALYTICS_EVENT_NAMES as readonly string[]).includes(name)
}

/** The gtag call for a hook payload, or null when the name is unknown. Params are plain strings, trimmed to a safe length. */
export function buildGaEvent(name: unknown, params: unknown): GtagCall | null {
  if (!isEventName(name)) return null
  const safe: Record<string, string> = {}
  if (params && typeof params === 'object') {
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') safe[key] = value.slice(0, MAX_PARAM_LENGTH)
    }
  }
  return ['event', name, safe]
}
