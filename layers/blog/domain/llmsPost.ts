import { parseFrontMatter } from './frontMatter'

export interface LlmsPost {
  slug: string
  title: string
  content: string
}

/** One raw Markdown post (`<slug>.md` source) as `llms-full.txt` lists it: front matter stripped, title from front matter. */
export function parseLlmsPost(file: string, raw: string): LlmsPost {
  const fm = parseFrontMatter(raw)
  const slug = file.replace(/\.md$/, '')
  return {
    slug,
    title: typeof fm.title === 'string' ? fm.title : slug,
    content: raw.replace(/^---[\s\S]*?---\r?\n/, '').trim(),
  }
}
