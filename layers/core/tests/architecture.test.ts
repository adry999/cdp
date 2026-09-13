/// <reference types="node" />
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { checkArchitecture, type LayerDependencies, type SourceFile } from './architectureRules'

const LAYER_DEPENDENCIES: LayerDependencies = {
  core: [],
  consent: ['core'],
}

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url))
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
})
