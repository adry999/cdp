import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { validatePostFrontMatter } from './domain/frontMatter'
import { readPosts } from './readPosts'

const posts = readPosts(fileURLToPath(new URL('./content', import.meta.url)))

describe('blog content', () => {
  it('has at least one post per locale', () => {
    expect(posts.some((p) => p.folder === 'ro')).toBe(true)
    expect(posts.some((p) => p.folder === 'en')).toBe(true)
  })

  it('has valid, correctly paired front matter in every post', () => {
    expect(validatePostFrontMatter(posts)).toEqual([])
  })

  it('has a generated OG image per published post (run `npm run blog-og`)', () => {
    const missing = posts
      .filter((p) => p.data.draft !== true)
      .map((p) => `public/og/blog/${p.folder}/${p.file}.png`)
      .filter((path) => !existsSync(fileURLToPath(new URL(`../../${path}`, import.meta.url))))
    expect(missing).toEqual([])
  })
})
