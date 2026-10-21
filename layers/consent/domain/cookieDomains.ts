const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/

// Cookie `domain=` values a tracker could have used on this host: the host itself and every
// parent except the bare TLD (`www.codepedia.md` -> `.www.codepedia.md`, `.codepedia.md`).
// Single-label hosts (localhost) and IP addresses never take a domain attribute.
export function cookieDomainCandidates(hostname: string): string[] {
  const host = hostname.toLowerCase()
  if (IPV4.test(host) || host.includes(':')) return []
  const labels = host.split('.').filter(Boolean)
  const domains: string[] = []
  for (let i = 0; i < labels.length - 1; i++) domains.push(`.${labels.slice(i).join('.')}`)
  return domains
}
