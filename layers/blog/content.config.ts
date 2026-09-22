import { defineCollection, defineContentConfig, z } from '@nuxt/content'

// Both locales share this shape. `blog_ro`/`blog_en` are paired by filename
// — content.test.ts enforces that every RO post has an EN counterpart (and
// vice versa) with the same `draft` value in both.
const postSchema = z.object({
  summary: z.string(),
  date: z.date(),
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
