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
})
