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
})
