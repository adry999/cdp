// "Aplicație ..." (RO) and "Desktop app" / "Windows desktop app" (EN) mark a software product,
// which gets a SoftwareApplication in the case study's JSON-LD.
const APP_KIND_PREFIXES = ['aplicație', 'desktop app', 'windows desktop app']

export function isAppKind(kind: string): boolean {
  const lower = kind.trim().toLowerCase()
  return APP_KIND_PREFIXES.some((prefix) => lower.startsWith(prefix))
}

/**
 * The product name is what the card title says before its first colon ("Startica: program de
 * evidență" gives "Startica"). Without an app kind or without a colon there is nothing to claim.
 */
export function softwareApplicationAbout(kind: string, cardTitle: string) {
  if (!isAppKind(kind)) return undefined
  const colon = cardTitle.indexOf(':')
  const name = colon > 0 ? cardTitle.slice(0, colon).trim() : ''
  if (!name) return undefined
  return {
    '@type': 'SoftwareApplication',
    name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Windows',
  }
}
