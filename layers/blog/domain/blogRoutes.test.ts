import { describe, expect, it } from 'vitest'
import { blogPrerenderRoutes, blogSitemapPages, type RoutePost } from './blogRoutes'

const post = (slug: string, alt: string, category: RoutePost['category']): RoutePost => ({ slug, alt, category, updated: '2027-01-01' })
const roPosts = [post('a', 'a-en', 'COST'), post('b', 'b-en', 'COST'), post('c', 'c-en', 'COST'), post('d', 'd-en', 'AI')]
const enPosts = [post('a-en', 'a', 'COST'), post('b-en', 'b', 'COST'), post('c-en', 'c', 'COST'), post('d-en', 'd', 'AI')]

describe('blogSitemapPages', () => {
  const pages = blogSitemapPages(roPosts, enPosts)

  it('lists the index and posts paired by alt, with x-default RO', () => {
    expect(pages).toContainEqual({ ro: '/blog', en: '/en/blog', xDefault: 'ro' })
    expect(pages).toContainEqual({ ro: '/blog/a', en: '/en/blog/a-en', lastmod: '2027-01-01', xDefault: 'ro' })
  })

  it('lists only indexable categories', () => {
    expect(pages).toContainEqual({ ro: '/blog/categorie/preturi', en: '/en/blog/category/pricing', xDefault: 'ro' })
    expect(pages.some((page) => page.ro.includes('automatizare-ai'))).toBe(false)
  })

  it('omits a post without a published counterpart and an empty blog index', () => {
    expect(blogSitemapPages(roPosts, enPosts.slice(1)).some((page) => page.ro === '/blog/a')).toBe(false)
    expect(blogSitemapPages([], [])).toEqual([])
  })
})

describe('blogPrerenderRoutes', () => {
  it('covers indexes, feeds, posts and every category that has a post, in both locales', () => {
    const routes = blogPrerenderRoutes(roPosts, enPosts)
    expect(routes).toEqual(
      expect.arrayContaining([
        '/blog',
        '/en/blog',
        '/blog/rss.xml',
        '/en/blog/rss.xml',
        '/blog/a',
        '/en/blog/a-en',
        '/blog/categorie/preturi',
        '/blog/categorie/automatizare-ai',
        '/en/blog/category/ai-automation',
      ]),
    )
    expect(routes.some((route) => route.includes('granturi') || route.includes('grants'))).toBe(false)
  })
})
