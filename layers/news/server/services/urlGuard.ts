// Server-side request forgery guard for the "pre-fill from link" route: which URLs and which resolved
// addresses may be fetched. Pure; DNS resolution and the request itself live in previewNewsSource.ts / nodeFetchDeps.ts.
// Everything unrecognised fails closed (treated as private).

export type UrlRejection = 'invalid' | 'scheme' | 'credentials' | 'port' | 'host'

export type UrlCheck = { ok: true; url: URL } | { ok: false; reason: UrlRejection }

const ALLOWED_PORTS = new Set(['', '80', '443'])
const INTERNAL_SUFFIXES = ['.localhost', '.local', '.internal', '.lan', '.home', '.corp', '.intranet', '.home.arpa']

function parseIPv4(value: string): [number, number, number, number] | null {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(value)
  if (!match) return null
  const parts = match.slice(1).map(Number)
  if (parts.some((part) => part > 255)) return null
  return [parts[0]!, parts[1]!, parts[2]!, parts[3]!]
}

/** Eight 16-bit groups, or null when `value` is not a valid IPv6 address. */
function parseIPv6(value: string): number[] | null {
  let text = value.replace(/^\[|\]$/g, '')
  const zone = text.indexOf('%')
  if (zone !== -1) text = text.slice(0, zone)
  if (!text.includes(':')) return null

  // A trailing dotted quad (::ffff:127.0.0.1) stands for two groups.
  const lastColon = text.lastIndexOf(':')
  const tail = text.slice(lastColon + 1)
  if (tail.includes('.')) {
    const v4 = parseIPv4(tail)
    if (!v4) return null
    text = `${text.slice(0, lastColon + 1)}${((v4[0] << 8) | v4[1]).toString(16)}:${((v4[2] << 8) | v4[3]).toString(16)}`
  }

  const halves = text.split('::')
  if (halves.length > 2) return null
  const toGroups = (part: string) => (part === '' ? [] : part.split(':'))
  const head = toGroups(halves[0]!)
  const rest = halves.length === 2 ? toGroups(halves[1]!) : []
  const missing = 8 - head.length - rest.length
  if (halves.length === 2 ? missing < 1 : missing !== 0) return null

  const groups = [...head, ...Array<string>(halves.length === 2 ? missing : 0).fill('0'), ...rest]
  const numbers = groups.map((group) => (/^[0-9a-f]{1,4}$/i.test(group) ? parseInt(group, 16) : Number.NaN))
  return numbers.length === 8 && numbers.every((n) => !Number.isNaN(n)) ? numbers : null
}

function isPrivateIPv4([a, b, c]: readonly number[]): boolean {
  return (
    a === 0 || // "this network"
    a === 10 ||
    a === 127 ||
    (a === 100 && b! >= 64 && b! <= 127) || // carrier-grade NAT
    (a === 169 && b === 254) || // link-local, incl. the 169.254.169.254 metadata endpoint
    (a === 172 && b! >= 16 && b! <= 31) ||
    (a === 192 && b === 0 && c === 0) || // IETF protocol assignments
    (a === 192 && b === 0 && c === 2) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) || // benchmarking
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a! >= 224 // multicast and reserved
  )
}

function v4FromGroups(high: number, low: number): number[] {
  return [high >> 8, high & 0xff, low >> 8, low & 0xff]
}

function isPrivateIPv6(g: readonly number[]): boolean {
  const [g0, g1, g2, g3, g4, g5, g6, g7] = g as [number, number, number, number, number, number, number, number]
  if (g0 === 0 && g1 === 0 && g2 === 0 && g3 === 0 && g4 === 0) {
    if (g5 === 0xffff) return isPrivateIPv4(v4FromGroups(g6, g7)) // IPv4-mapped
    if (g5 === 0) return true // ::, ::1 and IPv4-compatible
  }
  if (g0 === 0x64 && g1 === 0xff9b) {
    // NAT64: the /96 well-known prefix carries an IPv4 address, the /48 local-use one is internal.
    return g2 === 0 && g3 === 0 && g4 === 0 && g5 === 0 ? isPrivateIPv4(v4FromGroups(g6, g7)) : true
  }
  if (g0 === 0x2002) return isPrivateIPv4(v4FromGroups(g1, g2)) // 6to4
  return (
    (g0 === 0x2001 && g1 === 0) || // Teredo
    (g0 === 0x2001 && g1 === 0xdb8) || // documentation
    (g0 === 0x100 && g1 === 0 && g2 === 0 && g3 === 0) || // discard-only
    (g0 & 0xfe00) === 0xfc00 || // unique local
    (g0 & 0xffc0) === 0xfe80 || // link-local
    (g0 & 0xffc0) === 0xfec0 || // site-local
    (g0 & 0xff00) === 0xff00 // multicast
  )
}

/** True for loopback, private, link-local, metadata, multicast and every other non-public address, and for anything that is not an IP. */
export function isPrivateAddress(address: string): boolean {
  const v4 = parseIPv4(address)
  if (v4) return isPrivateIPv4(v4)
  const v6 = parseIPv6(address)
  return v6 ? isPrivateIPv6(v6) : true
}

function isIpLiteral(hostname: string): boolean {
  return parseIPv4(hostname) !== null || hostname.startsWith('[') || hostname.includes(':')
}

/**
 * The syntactic half of the guard: http(s) only, no credentials, ports 80/443 only, no internal-looking
 * hostname, and an IP literal must itself be public. A hostname still has to be resolved and each
 * address checked with `isPrivateAddress`.
 */
export function parsePublicUrl(raw: string): UrlCheck {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return { ok: false, reason: 'invalid' }
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return { ok: false, reason: 'scheme' }
  if (url.username || url.password) return { ok: false, reason: 'credentials' }
  if (!ALLOWED_PORTS.has(url.port)) return { ok: false, reason: 'port' }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, '')
  if (!hostname) return { ok: false, reason: 'invalid' }
  if (isIpLiteral(hostname)) return isPrivateAddress(hostname) ? { ok: false, reason: 'host' } : { ok: true, url }
  if (!hostname.includes('.') || hostname === 'localhost' || INTERNAL_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    return { ok: false, reason: 'host' }
  }
  return { ok: true, url }
}
