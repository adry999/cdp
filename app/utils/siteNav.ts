export type SiteNavLink =
  | { kind: 'hash'; hash: string; label: string }
  | { kind: 'route'; routeName: string; label: string }

export const HOME_NAV_LINKS: SiteNavLink[] = [
  { kind: 'hash', hash: '#servicii', label: 'nav.services' },
  { kind: 'hash', hash: '#proiecte', label: 'nav.work' },
  { kind: 'hash', hash: '#stack', label: 'nav.stack' },
]

export const PAGE_NAV_LINKS: SiteNavLink[] = [
  { kind: 'route', routeName: 'servicii', label: 'nav.services' },
  { kind: 'route', routeName: 'proiecte', label: 'nav.work' },
  { kind: 'hash', hash: '#stack', label: 'nav.stack' },
]
