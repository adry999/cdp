import type { RouteLocationRaw } from 'vue-router'

export type SiteNavId = 'services' | 'work' | 'blog'

/** A header link that is not the services dropdown. `hash` lands on a section of the target page. */
export interface SiteNavLink {
  id: Exclude<SiteNavId, 'services'>
  routeName: string
  hash?: string
  label: string
}

// The same on every page; the services dropdown comes first (see SiteHeaderServicesMenu).
export const SITE_NAV_LINKS: readonly SiteNavLink[] = [
  { id: 'work', routeName: 'proiecte', label: 'nav.projects' },
  { id: 'blog', routeName: 'blog', label: 'nav.blog' },
]

function isRouteOrChild(baseName: string, route: string): boolean {
  return baseName === route || baseName.startsWith(`${route}-`)
}

/** Which header item marks the current page. */
export function activeNavId(routeBaseName: string | undefined): SiteNavId | null {
  if (!routeBaseName) return null
  if (isRouteOrChild(routeBaseName, 'servicii')) return 'services'
  if (isRouteOrChild(routeBaseName, 'proiecte')) return 'work'
  if (isRouteOrChild(routeBaseName, 'blog')) return 'blog'
  return null
}

interface ServiceNavGroupSpec {
  labelKey: string
  slugs: readonly string[]
}

const SERVICE_NAV_GROUPS: readonly ServiceNavGroupSpec[] = [
  { labelKey: 'nav.groupSites', slugs: ['website', 'wordpress', 'shopify'] },
  { labelKey: 'nav.groupApps', slugs: ['web-app', 'ai-automation', 'granturi'] },
]

export interface ServiceNavGroup<L> {
  labelKey: string
  links: L[]
}

/** Splits services into the dropdown's two groups, keeping the group's order and dropping empty groups. */
export function groupServiceLinks<L extends { slug: string }>(links: readonly L[]): ServiceNavGroup<L>[] {
  return SERVICE_NAV_GROUPS.map(({ labelKey, slugs }) => ({
    labelKey,
    links: slugs.flatMap((slug) => links.filter((link) => link.slug === slug)),
  })).filter((group) => group.links.length > 0)
}

/** The service whose page is open (`/servicii/[slug]`), matched on the locale's route slug. */
export function currentServiceSlug<L extends { slug: string; routeSlug: Record<'ro' | 'en', string> }>(
  links: readonly L[],
  routeBaseName: string | undefined,
  routeSlugParam: unknown,
  locale: 'ro' | 'en',
): string | null {
  if (routeBaseName !== 'servicii-slug' || typeof routeSlugParam !== 'string') return null
  return links.find((link) => link.routeSlug[locale] === routeSlugParam)?.slug ?? null
}

/** One service as the dropdown and the mobile panel show it. */
export interface NavService {
  slug: string
  name: string
  intro: string
  to: string
}

export interface NavServiceGroup {
  label: string
  services: NavService[]
}

/** A resolved header link, as the mobile panel lists it. */
export interface HeaderNavItem {
  id: SiteNavId
  label: string
  to: RouteLocationRaw
  active: boolean
}
