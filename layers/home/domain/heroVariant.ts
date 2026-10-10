export const HERO_VARIANTS = ['dot-matrix', 'constellation', 'light-orbs'] as const
export type HeroVariant = (typeof HERO_VARIANTS)[number]

/** Values accepted by `?hero=` and the env var; `none` turns the background off. */
export type HeroChoice = HeroVariant | 'none'

export const DEFAULT_HERO_VARIANT: HeroVariant = 'dot-matrix'

const DISABLED_ALIASES = ['none', 'false', 'disabled']

export function isHeroVariant(value: unknown): value is HeroVariant {
  return typeof value === 'string' && (HERO_VARIANTS as readonly string[]).includes(value)
}

/** Parses a preview request (`?hero=`). Returns `undefined` for anything not recognised. */
export function parseHeroPreview(value: unknown): HeroChoice | undefined {
  if (value === 'none') return 'none'
  return isHeroVariant(value) ? value : undefined
}

/** Resolves the configured value (env var): unknown values fall back to the default. */
export function resolveHeroVariant(value: string | undefined): HeroVariant | null {
  const v = value || DEFAULT_HERO_VARIANT
  if (DISABLED_ALIASES.includes(v)) return null
  return isHeroVariant(v) ? v : DEFAULT_HERO_VARIANT
}
