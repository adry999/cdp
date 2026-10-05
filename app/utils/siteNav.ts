export type SiteNavLink =
  | { kind: 'hash'; hash: string; label: string }
  | { kind: 'route'; routeName: string; label: string }

export const HOME_NAV_LINKS: SiteNavLink[] = [
  { kind: 'hash', hash: '#servicii', label: 'nav.services' },
  { kind: 'hash', hash: '#stack', label: 'nav.stack' },
  { kind: 'hash', hash: '#proces', label: 'nav.process' },
  { kind: 'hash', hash: '#proiecte', label: 'nav.work' },
  { kind: 'route', routeName: 'blog', label: 'nav.blog' },
  { kind: 'hash', hash: '#contact', label: 'nav.contact' },
]

export const PAGE_NAV_LINKS: SiteNavLink[] = [
  { kind: 'route', routeName: 'servicii', label: 'nav.services' },
  { kind: 'route', routeName: 'preturi', label: 'nav.pricing' },
  { kind: 'route', routeName: 'despre', label: 'nav.about' },
  { kind: 'route', routeName: 'contact', label: 'nav.contact' },
  { kind: 'route', routeName: 'proiecte', label: 'nav.work' },
  { kind: 'route', routeName: 'blog', label: 'nav.blog' },
]
