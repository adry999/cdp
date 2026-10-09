import { describe, expect, it } from 'vitest'
import { newsArticleSchema } from './seo'

const base = {
  locale: 'ro' as const,
  url: 'https://codepedia.md/noutati/ghid',
  primaryOrigin: 'https://codepedia.studio',
  headline: 'Titlu',
  description: 'Rezumatul nostru.',
  publishedAt: '2026-10-01T09:00:00.000Z',
  modifiedAt: '2026-10-02T09:00:00.000Z',
  sourceUrl: 'https://example.com/a',
  sourceName: 'Example News',
}

describe('newsArticleSchema', () => {
  it('names CODEPEDIA as author and publisher and cites the source', () => {
    const schema = newsArticleSchema({ ...base, sourceAuthor: 'Ana Pop', sourceDate: '2026-09-30' })
    expect(schema['@type']).toBe('NewsArticle')
    expect(schema.author).toEqual({ '@type': 'Organization', name: 'CODEPEDIA', url: 'https://codepedia.studio' })
    expect(schema.publisher).toEqual(schema.author)
    expect(schema.datePublished).toBe('2026-10-01T09:00:00.000Z')
    expect(schema.isBasedOn).toMatchObject({
      url: 'https://example.com/a',
      publisher: { name: 'Example News' },
      author: { name: 'Ana Pop' },
      datePublished: '2026-09-30',
    })
    expect(schema.citation).toEqual(schema.isBasedOn)
  })

  it('omits unknown source fields and uses our url as the page', () => {
    const schema = newsArticleSchema(base)
    expect(schema.isBasedOn).not.toHaveProperty('author')
    expect(schema.isBasedOn).not.toHaveProperty('datePublished')
    expect(schema.mainEntityOfPage).toBe(base.url)
    expect(schema.inLanguage).toBe('ro-RO')
  })
})
