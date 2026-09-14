// @ts-check
import { readFileSync } from 'node:fs'
import withNuxt from './.nuxt/eslint.config.mjs'

const layerDependencies = JSON.parse(readFileSync(new URL('./layers/dependencies.json', import.meta.url), 'utf8'))

const LAYER_PUBLIC_ENTRY = {
  regex: '^#layers/(?!core/)[^/]+/(?!server$)',
  message: 'Import a feature layer only through #layers/<layer> or #layers/<layer>/server.',
}

const LAYER_FILE_PATH = {
  regex: '(^|/)layers/',
  message: 'Import a layer through its #layers/<layer> alias, never by file path.',
}

function layerBoundary(layer, dependencies) {
  const fullAccess = dependencies.includes('core') ? [layer, 'core'] : [layer]
  const publicOnly = dependencies.filter((dependency) => dependency !== 'core')
  const regex =
    `^#layers/(?!(${fullAccess.join('|')})(/|$))` +
    (publicOnly.length ? `(?!(${publicOnly.join('|')})(/server)?$)` : '')
  const message =
    layer === 'core'
      ? 'layers/core must not import another layer.'
      : publicOnly.length
        ? `layers/${layer} may import its own files, #layers/core/... and only ${publicOnly
            .map((dependency) => `#layers/${dependency} or #layers/${dependency}/server`)
            .join(', ')} of ${publicOnly.join(', ')}.`
        : `layers/${layer} may import only its own files and #layers/core/....`
  return {
    files: [`layers/${layer}/**/*.{ts,vue}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { regex, message },
            { regex: '^(~|~~|@|@@|#shared)/', message: `layers/${layer} must not import root app/, server/ or shared/ code.` },
            {
              regex: '^\\.\\.(/|$)',
              message: `Inside layers/${layer} use ./ or #layers/${layer}/... paths; never climb with ../.`,
            },
          ],
        },
      ],
    },
  }
}

export default withNuxt(
  {
    rules: {
      // The project's own convention (see CLAUDE.md): no `any`, and code
      // that looks unused almost always means a real bug here, not a
      // deliberate stub.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
  // A layer joins layers/dependencies.json in the same commit that migrates it.
  ...Object.entries(layerDependencies).map(([layer, dependencies]) => layerBoundary(layer, dependencies)),
  {
    files: ['app/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            LAYER_PUBLIC_ENTRY,
            LAYER_FILE_PATH,
            { regex: '^~~/', message: 'Import root shared code through #shared/..., not ~~/.' },
          ],
        },
      ],
    },
  },
  {
    files: ['server/**/*.ts', 'shared/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            LAYER_PUBLIC_ENTRY,
            LAYER_FILE_PATH,
            {
              regex: '^~~?/',
              message: 'server/ and shared/ import through #shared/... or #layers/..., never ~/ or ~~/.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['supabase/migrations/**', 'design/**', 'docs/**'],
  },
)
