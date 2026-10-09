import { breadcrumbList, faqPage, organizationRef, type FaqEntry } from '#layers/core/shared/utils/jsonLd'
import type { InlineNode, PostBlock } from './body'
import { CATEGORIES, type CategoryCode } from './category'
import { blogPaths } from './paths'

export { blogPaths, ogImagePath } from './paths'

type Locale = 'ro' | 'en'

const SCHEMA = 'https://schema.org'

function inlineText(nodes: readonly InlineNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'break') return ' '
      if (node.type === 'text' || node.type === 'code') return node.text
      return inlineText(node.children)
    })
    .join('')
}

/** The FAQ questions rendered on the page, as plain text (one answer = its paragraphs joined by a space). */
export function faqEntries(blocks: readonly PostBlock[]): FaqEntry[] {
  return blocks.flatMap((block) =>
    block.type === 'faq'
      ? block.items.map((item) => ({
          question: item.question,
          answer: item.answer.map((paragraph) => inlineText(paragraph)).join(' '),
        }))
      : [],
  )
}

/** A builder's node without its own `@context`, for use inside a `@graph` that declares it once. */
function stripContext(node: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(node).filter(([key]) => key !== '@context'))
}

export interface ArticleGraphInput {
  locale: Locale
  /** The locale's official origin: every URL of the page sits on it. */
  origin: string
  /** The primary (EN) origin, where the Organization's logo lives. */
  primaryOrigin: string
  slug: string
  title: string
  description: string
  keyword: string
  category: CategoryCode
  /** `YYYY-MM-DD`. */
  date: string
  updated: string
  /** Absolute URL. */
  image: string
  blocks: readonly PostBlock[]
  /** Localized labels for the breadcrumb: the site name and the blog section. */
  labels: { home: string; blog: string }
}

/** One `@graph` for an article: BlogPosting, BreadcrumbList and, when the post has FAQ items, FAQPage (SEO_SPEC §4). */
export function articleGraph(input: ArticleGraphInput) {
  const paths = blogPaths(input.locale)
  const url = `${input.origin}${paths.post(input.slug)}`
  const organization = organizationRef(input.primaryOrigin)
  const faq = faqEntries(input.blocks)
  const categoryName = CATEGORIES[input.category].name[input.locale]

  return {
    '@context': SCHEMA,
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: input.title,
        description: input.description,
        url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        inLanguage: input.locale,
        datePublished: input.date,
        dateModified: input.updated,
        image: input.image,
        articleSection: categoryName,
        keywords: input.keyword,
        author: organization,
        publisher: {
          ...organization,
          logo: { '@type': 'ImageObject', url: `${input.primaryOrigin}/icon-512.png`, width: 512, height: 512 },
        },
      },
      stripContext(
        breadcrumbList([
          { name: input.labels.home, url: `${input.origin}${input.locale === 'en' ? '/en' : '/'}` },
          { name: input.labels.blog, url: `${input.origin}${paths.index}` },
          { name: categoryName, url: `${input.origin}${paths.category(input.category)}` },
          { name: input.title, url },
        ]),
      ),
      ...(faq.length ? [stripContext(faqPage(faq))] : []),
    ],
  }
}

export interface ListedPost {
  slug: string
  title: string
}

export interface IndexGraphInput {
  locale: Locale
  origin: string
  primaryOrigin: string
  name: string
  description: string
  posts: readonly ListedPost[]
}

/** `Blog` plus an `ItemList` of its posts, for `/blog` (SEO_SPEC §4). */
export function blogIndexGraph(input: IndexGraphInput) {
  const paths = blogPaths(input.locale)
  const url = `${input.origin}${paths.index}`
  return {
    '@context': SCHEMA,
    '@graph': [
      {
        '@type': 'Blog',
        name: input.name,
        description: input.description,
        url,
        inLanguage: input.locale,
        publisher: organizationRef(input.primaryOrigin),
      },
      {
        '@type': 'ItemList',
        itemListElement: input.posts.map((post, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${input.origin}${paths.post(post.slug)}`,
          name: post.title,
        })),
      },
    ],
  }
}

export interface CategoryGraphInput {
  locale: Locale
  origin: string
  category: CategoryCode
  name: string
  description: string
  labels: { home: string; blog: string }
}

/** `CollectionPage` plus a `BreadcrumbList` for a category page. */
export function categoryGraph(input: CategoryGraphInput) {
  const paths = blogPaths(input.locale)
  const url = `${input.origin}${paths.category(input.category)}`
  const categoryName = CATEGORIES[input.category].name[input.locale]
  return {
    '@context': SCHEMA,
    '@graph': [
      { '@type': 'CollectionPage', name: input.name, description: input.description, url, inLanguage: input.locale },
      stripContext(
        breadcrumbList([
          { name: input.labels.home, url: `${input.origin}${input.locale === 'en' ? '/en' : '/'}` },
          { name: input.labels.blog, url: `${input.origin}${paths.index}` },
          { name: categoryName, url },
        ]),
      ),
    ],
  }
}
