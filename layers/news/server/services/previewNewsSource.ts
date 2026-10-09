import type { NewsPreview } from '#layers/news/domain/preview'
import { extractPageMeta } from '#layers/news/server/services/pageMeta'
import { isPrivateAddress, parsePublicUrl } from '#layers/news/server/services/urlGuard'

export const MAX_REDIRECTS = 3
export const MAX_BODY_BYTES = 512 * 1024
export const FETCH_TIMEOUT_MS = 5000

export interface ResolvedAddress {
  address: string
  family: 4 | 6
}

export interface RawResponse {
  status: number
  location: string | null
  contentType: string | null
  /** At most `maxBytes` of the body, decoded as text; the rest is never read. */
  readText(maxBytes: number): Promise<string>
}

export interface PreviewDeps {
  /** Every address `hostname` resolves to. */
  resolve(hostname: string): Promise<ResolvedAddress[]>
  /** One GET with no redirect following, connecting to `pinned` (the address already vetted) rather than resolving again. */
  get(url: URL, pinned: ResolvedAddress, signal: AbortSignal): Promise<RawResponse>
}

export type PreviewResult =
  | { outcome: 'ok'; preview: NewsPreview }
  | { outcome: 'invalid' | 'blocked' | 'unreachable' | 'not_html' | 'too_many_redirects' }

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])
const HTML_TYPE = /^(text\/html|application\/xhtml\+xml)\b/i

class Deadline extends Error {}

function withDeadline<T>(work: Promise<T>, ms: number, controller: AbortController): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const expired = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort()
      reject(new Deadline())
    }, ms)
  })
  return Promise.race([work, expired]).finally(() => clearTimeout(timer))
}

/** Resolves a hostname and vets every address; any private one rejects the whole host. */
async function vetHost(url: URL, deps: PreviewDeps): Promise<ResolvedAddress | 'blocked' | 'unreachable'> {
  const hostname = url.hostname.replace(/^\[|\]$/g, '')
  const addresses = await deps.resolve(hostname)
  if (!addresses.length) return 'unreachable'
  if (addresses.some((entry) => isPrivateAddress(entry.address))) return 'blocked'
  return addresses[0]!
}

async function fetchHtml(rawUrl: string, deps: PreviewDeps, signal: AbortSignal): Promise<{ html: string; finalUrl: string } | PreviewResult> {
  let current = rawUrl
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const checked = parsePublicUrl(current)
    if (!checked.ok) return { outcome: hop === 0 && checked.reason !== 'host' ? 'invalid' : 'blocked' }

    const pinned = await vetHost(checked.url, deps)
    if (pinned === 'blocked' || pinned === 'unreachable') return { outcome: pinned }

    const response = await deps.get(checked.url, pinned, signal)
    if (REDIRECT_STATUSES.has(response.status)) {
      if (!response.location) return { outcome: 'unreachable' }
      try {
        current = new URL(response.location, checked.url).toString()
      } catch {
        return { outcome: 'unreachable' }
      }
      continue
    }
    if (response.status < 200 || response.status >= 300) return { outcome: 'unreachable' }
    if (!response.contentType || !HTML_TYPE.test(response.contentType)) return { outcome: 'not_html' }
    return { html: await response.readText(MAX_BODY_BYTES), finalUrl: checked.url.toString() }
  }
  return { outcome: 'too_many_redirects' }
}

/**
 * Fetches `rawUrl` as a public web page and returns the few descriptive fields it declares. Redirects are
 * followed by hand (at most `MAX_REDIRECTS`), and each hop is re-checked; the whole exchange has one deadline.
 * The page's HTML is read (first `MAX_BODY_BYTES`) and discarded: only extracted text is returned.
 */
export async function previewNewsSource(rawUrl: string, deps: PreviewDeps, timeoutMs = FETCH_TIMEOUT_MS): Promise<PreviewResult> {
  const controller = new AbortController()
  try {
    const result = await withDeadline(fetchHtml(rawUrl, deps, controller.signal), timeoutMs, controller)
    if ('outcome' in result) return result
    return { outcome: 'ok', preview: { ...extractPageMeta(result.html), finalUrl: result.finalUrl } }
  } catch {
    return { outcome: 'unreachable' }
  }
}
