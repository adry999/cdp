/** The blog is written Romanian-first: its pages name the RO URL as hreflang x-default. */
const RO_FIRST_PREFIX = '/blog'

/** Locale that hreflang x-default points at for the page whose RO path is `roPath`: EN site-wide, RO for `/blog/**`. */
export function xDefaultLocale(roPath: string): 'ro' | 'en' {
  const path = roPath.replace(/\/$/, '')
  return path === RO_FIRST_PREFIX || path.startsWith(`${RO_FIRST_PREFIX}/`) ? 'ro' : 'en'
}
