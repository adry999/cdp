export const CATEGORY_CODES = ['COST', 'ALEG', 'IND', 'AI', 'GRANT', 'PROC', 'MKT'] as const

export type CategoryCode = (typeof CATEGORY_CODES)[number]

interface PerLocale {
  ro: string
  en: string
}

interface CategoryInfo {
  /** Segment used in `/blog/categorie/<slug>` (RO) and `/en/blog/category/<slug>` (EN). */
  slug: PerLocale
  name: PerLocale
}

export const CATEGORIES: Readonly<Record<CategoryCode, CategoryInfo>> = {
  COST: { slug: { ro: 'preturi', en: 'pricing' }, name: { ro: 'Prețuri și costuri', en: 'Prices and costs' } },
  ALEG: { slug: { ro: 'alegeri-tehnice', en: 'tech-choices' }, name: { ro: 'Alegeri tehnice', en: 'Tech choices' } },
  IND: { slug: { ro: 'industrii', en: 'industries' }, name: { ro: 'Pe industrie', en: 'By industry' } },
  AI: { slug: { ro: 'automatizare-ai', en: 'ai-automation' }, name: { ro: 'Automatizare și AI', en: 'Automation and AI' } },
  GRANT: { slug: { ro: 'granturi', en: 'grants' }, name: { ro: 'Granturi și finanțări', en: 'Grants and funding' } },
  PROC: { slug: { ro: 'proces', en: 'process' }, name: { ro: 'Proces și agenție', en: 'Process and agency' } },
  MKT: { slug: { ro: 'seo-marketing', en: 'seo-marketing' }, name: { ro: 'SEO și marketing local', en: 'SEO and local marketing' } },
}

export function isCategoryCode(value: unknown): value is CategoryCode {
  return typeof value === 'string' && (CATEGORY_CODES as readonly string[]).includes(value)
}

/** The category whose URL segment is `slug` in `locale`, or null. */
export function categoryFromSlug(slug: string, locale: 'ro' | 'en'): CategoryCode | null {
  return CATEGORY_CODES.find((code) => CATEGORIES[code].slug[locale] === slug) ?? null
}
