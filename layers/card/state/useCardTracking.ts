import type { CardEventKind } from '#layers/card/domain/cardEvents'

const ENDPOINT = '/api/card/events'

/**
 * Counts what happens on /c (admin: Cărți de vizită). Anonymous: no cookie, no identifier; the
 * visit is counted once per browser session. sendBeacon survives the navigation a click starts
 * (tel:, wa.me, the vCard download). A failed count never affects the page.
 */
export function useCardTracking(slug: string, source: () => string | undefined) {
  function track(kind: CardEventKind) {
    if (!import.meta.client) return
    const body = JSON.stringify({ slug, kind, source: source() })
    try {
      if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'application/json' }))) return
    } catch {
      // Fall through to fetch.
    }
    fetch(ENDPOINT, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {})
  }

  onMounted(() => {
    const key = `card:viewed:${slug}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      // Storage blocked (private mode): count the visit anyway.
    }
    track('view')
  })

  return { track }
}
