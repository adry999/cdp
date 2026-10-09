import { fileURLToPath } from 'node:url'
import { blogPrerenderRoutes, type RoutePost } from './domain/blogRoutes'
import { isCategoryCode } from './domain/category'
import { validatePostFrontMatter, type PostLocale, type RawPost } from './domain/frontMatter'
import { readPosts } from './readPosts'

const contentDir = fileURLToPath(new URL('./content', import.meta.url))

function publishedRoutePosts(posts: readonly RawPost[], folder: PostLocale): RoutePost[] {
  return posts.flatMap(({ folder: postFolder, data }) =>
    postFolder === folder &&
    data.draft !== true &&
    typeof data.slug === 'string' &&
    typeof data.alt === 'string' &&
    typeof data.updated === 'string' &&
    isCategoryCode(data.category)
      ? [{ slug: data.slug, alt: data.alt, category: data.category, updated: data.updated }]
      : [],
  )
}

const posts = readPosts(contentDir)

export default defineNuxtConfig({
  // `nuxt build` doesn't crawl links, so every blog URL is listed here from the content files (SEO_SPEC §7).
  nitro: {
    prerender: { routes: blogPrerenderRoutes(publishedRoutePosts(posts, 'ro'), publishedRoutePosts(posts, 'en')) },
  },
  hooks: {
    // Build gate (SEO_SPEC §1): bad front matter fails `nuxt build` / `nuxt dev` start.
    // Skipped for `nuxt prepare` (postinstall), which must never fail on content.
    ready(nuxt) {
      if (nuxt.options._prepare) return
      const issues = validatePostFrontMatter(posts)
      if (issues.length) {
        throw new Error(`Blog front matter is invalid:\n${issues.map((issue) => `  - ${issue}`).join('\n')}`)
      }
    },
  },
})
