export const HERO_VARIANTS = ['dot-matrix', 'constellation', 'light-orbs'] as const
export type HeroVariant = (typeof HERO_VARIANTS)[number]

/** Values accepted by `?hero=` and the admin; `none` turns the background off. */
export type HeroChoice = HeroVariant | 'none'

export const DEFAULT_HERO_VARIANT: HeroVariant = 'dot-matrix'

export function isHeroVariant(value: unknown): value is HeroVariant {
  return typeof value === 'string' && (HERO_VARIANTS as readonly string[]).includes(value)
}

/** Parses a preview request (`?hero=`). Returns `undefined` for anything not recognised. */
export function parseHeroPreview(value: unknown): HeroChoice | undefined {
  if (value === 'none') return 'none'
  return isHeroVariant(value) ? value : undefined
}

export function isHeroChoice(value: unknown): value is HeroChoice {
  return value === 'none' || isHeroVariant(value)
}

/**
 * Homepage precedence: `?hero=` preview, then the admin's stored choice, then dot-matrix.
 * Returns the variant to render, or `null` for no background.
 */
export function chooseHeroVariant(sources: { preview?: HeroChoice; stored: HeroChoice | null }): HeroVariant | null {
  const choice = sources.preview ?? sources.stored ?? DEFAULT_HERO_VARIANT
  return choice === 'none' ? null : choice
}
