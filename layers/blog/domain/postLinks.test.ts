import { describe, expect, it } from 'vitest'
import { POST_SERVICES } from './frontMatter'
import { POST_SERVICE_PAGES } from './postLinks'

describe('POST_SERVICE_PAGES', () => {
  it('covers every service a post may point to', () => {
    expect(Object.keys(POST_SERVICE_PAGES).sort()).toEqual([...POST_SERVICES].sort())
  })
})
