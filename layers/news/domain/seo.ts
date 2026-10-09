import { organizationRef } from '#layers/core/shared/utils/jsonLd'

export interface NewsArticleInput {
  locale: 'ro' | 'en'
  /** Our canonical URL of the item. */
  url: string
  /** The primary (EN) origin, the Organization's `url`. */
  primaryOrigin: string
  headline: string
  /** Our summary, never the source's text. */
  description: string
  /** ISO timestamp of our publication. */
  publishedAt: string
  modifiedAt: string
  sourceUrl: string
  sourceName: string
  sourceAuthor?: string | null
  /** `YYYY-MM-DD`. */
  sourceDate?: string | null
}

/** `NewsArticle` for one item: CODEPEDIA is author and publisher of the summary, the original is cited. */
export function newsArticleSchema(input: NewsArticleInput) {
  const org = organizationRef(input.primaryOrigin)
  const original = {
    '@type': 'CreativeWork',
    url: input.sourceUrl,
    publisher: { '@type': 'Organization', name: input.sourceName },
    ...(input.sourceAuthor ? { author: { '@type': 'Person', name: input.sourceAuthor } } : {}),
    ...(input.sourceDate ? { datePublished: input.sourceDate } : {}),
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: input.headline,
    description: input.description,
    datePublished: input.publishedAt,
    dateModified: input.modifiedAt,
    url: input.url,
    mainEntityOfPage: input.url,
    inLanguage: input.locale === 'en' ? 'en-US' : 'ro-RO',
    author: org,
    publisher: org,
    isBasedOn: original,
    citation: original,
  }
}
