import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const roDir = fileURLToPath(new URL('./content/ro', import.meta.url))
const enDir = fileURLToPath(new URL('./content/en', import.meta.url))

function mdFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()
}

function draftFlag(dir: string, file: string): boolean {
  const text = readFileSync(`${dir}/${file}`, 'utf8')
  return /^draft:\s*true\s*$/m.test(text)
}

/** The raw text between the opening and closing `---` of a post. */
function frontMatter(dir: string, file: string): string {
  const text = readFileSync(`${dir}/${file}`, 'utf8')
  return /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? ''
}

// `summary`, `date` and `description` are schema-required in content.config.ts,
// but a post missing one only fails silently: `npm run build` still exits 0
// and prints nothing, and the card/meta just render blank. These assertions
// are the only thing that makes an incomplete post loud.
const REQUIRED_KEYS = ['title', 'description', 'summary', 'date'] as const

describe('blog content', () => {
  const roFiles = mdFiles(roDir)
  const enFiles = mdFiles(enDir)

  it('has an EN file for every RO file', () => {
    expect(enFiles).toEqual(expect.arrayContaining(roFiles))
  })

  it('has a RO file for every EN file', () => {
    expect(roFiles).toEqual(expect.arrayContaining(enFiles))
  })

  it('has at least one post', () => {
    expect(roFiles.length).toBeGreaterThan(0)
  })

  it('agrees on the draft flag between locales for every post', () => {
    for (const file of roFiles) {
      expect(draftFlag(roDir, file)).toBe(draftFlag(enDir, file))
    }
  })

  it('has every required front-matter field in every post', () => {
    for (const [dir, files] of [
      [roDir, roFiles],
      [enDir, enFiles],
    ] as const) {
      for (const file of files) {
        const block = frontMatter(dir, file)
        for (const key of REQUIRED_KEYS) {
          expect(new RegExp(`^${key}:\\s*\\S`, 'm').test(block), `${dir}/${file} is missing "${key}"`).toBe(true)
        }
      }
    }
  })
})
