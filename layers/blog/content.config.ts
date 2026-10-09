import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { CATEGORY_CODES } from './domain/category'
import { POST_LOCALES, POST_SERVICES } from './domain/frontMatter'

// Both locales share this shape. `blog_ro`/`blog_en` are paired by the `alt`
// front-matter field (the counterpart's slug); domain/frontMatter.ts validates
// the pairing and the SEO length limits, and layers/blog/nuxt.config.ts runs it
// at build. This schema only guarantees field types.
const postSchema = z.object({
  slug: z.string(),
  lang: z.enum(POST_LOCALES),
  alt: z.string(),
  category: z.enum(CATEGORY_CODES),
  keyword: z.string(),
  date: z.date(),
  updated: z.date(),
  author: z.string(),
  service: z.enum(POST_SERVICES),
  case: z.string(),
  readingTime: z.number(),
  cover: z.string().optional(),
  draft: z.boolean().default(false),
})

export default defineContentConfig({
  collections: {
    blog_ro: defineCollection({
      type: 'page',
      source: { include: 'ro/**', prefix: '' },
      schema: postSchema,
    }),
    blog_en: defineCollection({
      type: 'page',
      source: { include: 'en/**', prefix: '' },
      schema: postSchema,
    }),
  },
})
