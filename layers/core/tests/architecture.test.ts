/// <reference types="node" />
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { checkArchitecture, type LayerDependencies, type SourceFile } from './architectureRules'

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url))
const LAYER_DEPENDENCIES = JSON.parse(readFileSync(join(repoRoot, 'layers/dependencies.json'), 'utf8')) as LayerDependencies
const SOURCE_ROOTS = ['app', 'server', 'shared', 'layers']

function readSources(): SourceFile[] {
  return SOURCE_ROOTS.filter((dir) => existsSync(join(repoRoot, dir))).flatMap((dir) =>
    readdirSync(join(repoRoot, dir), { recursive: true, encoding: 'utf8' })
      .filter((entry) => /\.(ts|vue)$/.test(entry))
      .map((entry) => {
        const absolutePath = join(repoRoot, dir, entry)
        return {
          path: relative(repoRoot, absolutePath).split(sep).join('/'),
          content: readFileSync(absolutePath, 'utf8'),
        }
      }),
  )
}

describe('architecture', () => {
  it('keeps every layer inside its declared dependencies', () => {
    expect(checkArchitecture(readSources(), LAYER_DEPENDENCIES)).toEqual([])
  })

  it('declares every dependency as a layer', () => {
    const layers = new Set(Object.keys(LAYER_DEPENDENCIES))
    const unknownDependencies = Object.values(LAYER_DEPENDENCIES)
      .flat()
      .filter((dependency) => !layers.has(dependency))
    expect(unknownDependencies).toEqual([])
  })
})
