import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseFrontMatter, POST_LOCALES, type RawPost } from './domain/frontMatter'

/** Reads every Markdown post under `<contentDir>/{ro,en}` and parses its front matter. */
export function readPosts(contentDir: string): RawPost[] {
  return POST_LOCALES.flatMap((folder) =>
    readdirSync(join(contentDir, folder))
      .filter((name) => name.endsWith('.md'))
      .sort()
      .map((name) => ({
        folder,
        file: name.slice(0, -'.md'.length),
        data: parseFrontMatter(readFileSync(join(contentDir, folder, name), 'utf8')),
      })),
  )
}
