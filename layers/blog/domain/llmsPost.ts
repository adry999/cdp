import { parseFrontMatter } from './frontMatter'

export interface LlmsPost {
  slug: string
  title: string
  content: string
}

/**
 * One raw Markdown post (`<slug>.md` source) as `llms-full.txt` lists it: front matter stripped,
 * title and slug from front matter (the file name when the slug is missing). Null for a draft.
 */
export function parseLlmsPost(file: string, raw: string): LlmsPost | null {
  const fm = parseFrontMatter(raw)
  if (fm.draft === true) return null
  const slug = typeof fm.slug === 'string' && fm.slug.trim() ? fm.slug.trim() : file.replace(/\.md$/, '')
  return {
    slug,
    title: typeof fm.title === 'string' ? fm.title : slug,
    content: raw.replace(/^---[\s\S]*?---\r?\n/, '').trim(),
  }
}
