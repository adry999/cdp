import { fileURLToPath } from 'node:url'
import { validatePostFrontMatter } from './domain/frontMatter'
import { readPosts } from './readPosts'

export default defineNuxtConfig({
  hooks: {
    // Build gate (SEO_SPEC §1): bad front matter fails `nuxt build` / `nuxt dev` start.
    // Skipped for `nuxt prepare` (postinstall), which must never fail on content.
    ready(nuxt) {
      if (nuxt.options._prepare) return
      const issues = validatePostFrontMatter(readPosts(fileURLToPath(new URL('./content', import.meta.url))))
      if (issues.length) {
        throw new Error(`Blog front matter is invalid:\n${issues.map((issue) => `  - ${issue}`).join('\n')}`)
      }
    },
  },
})
