import { describe, expect, it } from 'vitest'
import type { PostBlock } from './body'
import { articleGraph, blogIndexGraph, blogPaths, categoryGraph, faqEntries, ogImagePath } from './seo'

const blocks: PostBlock[] = [
  { type: 'p', children: [{ type: 'text', text: 'Intro' }] },
  {
    type: 'faq',
    items: [
      {
        question: 'Cât costă?',
        answer: [
          [{ type: 'text', text: 'De la ' }, { type: 'strong', children: [{ type: 'text', text: '1 000 EUR' }] }, { type: 'text', text: '.' }],
          [{ type: 'link', href: '/contact', children: [{ type: 'text', text: 'Scrie-ne' }] }],
        ],
      },
    ],
  },
]

const input = {
  locale: 'ro' as const,
  origin: 'https://codepedia.md',
  primaryOrigin: 'https://codepedia.studio',
  slug: 'cat-costa-un-site',
  title: 'Cât costă un site',
  description: 'Descriere',
  keyword: 'cât costă un site',
  category: 'COST' as const,
  date: '2027-01-02',
  updated: '2027-01-05',
  image: 'https://codepedia.md/og/blog/ro/cat-costa-un-site.png',
  blocks,
  labels: { home: 'CODEPEDIA', blog: 'Blog' },
}

describe('blogPaths', () => {
  it('builds RO and EN paths', () => {
    expect(blogPaths('ro').category('COST')).toBe('/blog/categorie/preturi')
    expect(blogPaths('en').category('COST')).toBe('/en/blog/category/pricing')
    expect(blogPaths('en').post('x')).toBe('/en/blog/x')
    expect(blogPaths('en').rss).toBe('/en/blog/rss.xml')
  })
})

describe('ogImagePath', () => {
  it('is per locale and slug', () => {
    expect(ogImagePath('en', 'a-b')).toBe('/og/blog/en/a-b.png')
  })
})

describe('faqEntries', () => {
  it('flattens each answer to plain text', () => {
    expect(faqEntries(blocks)).toEqual([{ question: 'Cât costă?', answer: 'De la 1 000 EUR. Scrie-ne' }])
  })

  it('is empty without a FAQ block', () => {
    expect(faqEntries(blocks.slice(0, 1))).toEqual([])
  })
})

describe('articleGraph', () => {
  const graph = articleGraph(input)
  const [post, crumbs, faq] = graph['@graph'] as Record<string, unknown>[]

  it('declares @context once and uses a single graph', () => {
    expect(graph['@context']).toBe('https://schema.org')
    expect(graph['@graph']).toHaveLength(3)
    expect(crumbs).not.toHaveProperty('@context')
    expect(faq).not.toHaveProperty('@context')
  })

  it('describes the BlogPosting', () => {
    expect(post).toMatchObject({
      '@type': 'BlogPosting',
      headline: 'Cât costă un site',
      datePublished: '2027-01-02',
      dateModified: '2027-01-05',
      inLanguage: 'ro',
      articleSection: 'Prețuri',
      keywords: 'cât costă un site',
      image: input.image,
      mainEntityOfPage: { '@id': 'https://codepedia.md/blog/cat-costa-un-site' },
      author: { '@type': 'Organization', url: 'https://codepedia.studio' },
      publisher: { logo: { url: 'https://codepedia.studio/icon-512.png' } },
    })
  })

  it('ends the breadcrumb at the article, through the category page', () => {
    expect(crumbs).toMatchObject({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { position: 1, item: 'https://codepedia.md/' },
        { position: 2, item: 'https://codepedia.md/blog' },
        { position: 3, name: 'Prețuri', item: 'https://codepedia.md/blog/categorie/preturi' },
        { position: 4, item: 'https://codepedia.md/blog/cat-costa-un-site' },
      ],
    })
  })

  it('builds FAQPage from the rendered FAQ and omits it without one', () => {
    expect(faq).toMatchObject({ '@type': 'FAQPage', mainEntity: [{ name: 'Cât costă?' }] })
    expect(articleGraph({ ...input, blocks: [] })['@graph']).toHaveLength(2)
  })

  it('uses EN paths and home on the EN origin', () => {
    const en = articleGraph({ ...input, locale: 'en', origin: 'https://codepedia.studio' })['@graph'] as Record<string, unknown>[]
    expect(en[1]).toMatchObject({
      itemListElement: [
        { item: 'https://codepedia.studio/en' },
        { item: 'https://codepedia.studio/en/blog' },
        { item: 'https://codepedia.studio/en/blog/category/pricing' },
        { item: 'https://codepedia.studio/en/blog/cat-costa-un-site' },
      ],
    })
  })
})

describe('blogIndexGraph', () => {
  it('lists posts in order with absolute URLs', () => {
    const [blog, list] = blogIndexGraph({
      locale: 'en',
      origin: 'https://codepedia.studio',
      primaryOrigin: 'https://codepedia.studio',
      name: 'Blog',
      description: 'd',
      posts: [
        { slug: 'a', title: 'A' },
        { slug: 'b', title: 'B' },
      ],
    })['@graph'] as Record<string, unknown>[]
    expect(blog).toMatchObject({ '@type': 'Blog', url: 'https://codepedia.studio/en/blog' })
    expect(list).toMatchObject({
      '@type': 'ItemList',
      itemListElement: [
        { position: 1, url: 'https://codepedia.studio/en/blog/a' },
        { position: 2, url: 'https://codepedia.studio/en/blog/b' },
      ],
    })
  })
})

describe('categoryGraph', () => {
  it('pairs a CollectionPage with its breadcrumb', () => {
    const graph = categoryGraph({
      locale: 'ro',
      origin: 'https://codepedia.md',
      category: 'AI',
      name: 'n',
      description: 'd',
      labels: input.labels,
    })
    expect(graph['@graph']).toMatchObject([
      { '@type': 'CollectionPage', url: 'https://codepedia.md/blog/categorie/automatizare-ai' },
      { '@type': 'BreadcrumbList' },
    ])
  })
})
