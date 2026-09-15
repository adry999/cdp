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

// no-restricted-imports doesn't see dynamic import('...') expressions — it
// only matches static import/export declarations. Mirror the same
// regex/message pairs as a no-restricted-syntax selector so a forbidden path
// can't sneak in through import(). Only literal and fully-static (no
// interpolation) template-literal sources can be checked statically.
function dynamicImportGuards(patterns) {
  return patterns.map(({ regex, message }) => {
    const source = regex.replace(/\//g, '\\/')
    return {
      selector:
        `ImportExpression[source.type='Literal'][source.value=/${source}/], ` +
        `ImportExpression[source.type='TemplateLiteral'][source.expressions.length=0][source.quasis.0.value.cooked=/${source}/]`,
      message,
    }
  })
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
  const patterns = [
    { regex, message },
    { regex: '^(~|~~|@|@@)/', message: `layers/${layer} must not import root app/ or server/ code.` },
    {
      regex: '^\\.\\.(/|$)',
      message: `Inside layers/${layer} use ./ or #layers/${layer}/... paths; never climb with ../.`,
    },
  ]
  return {
    files: [`layers/${layer}/**/*.{ts,vue}`],
    rules: {
      'no-restricted-imports': ['error', { patterns }],
      'no-restricted-syntax': ['error', ...dynamicImportGuards(patterns)],
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
      'no-restricted-imports': ['error', { patterns: [LAYER_PUBLIC_ENTRY, LAYER_FILE_PATH] }],
      'no-restricted-syntax': ['error', ...dynamicImportGuards([LAYER_PUBLIC_ENTRY, LAYER_FILE_PATH])],
    },
  },
  {
    files: ['server/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            LAYER_PUBLIC_ENTRY,
            LAYER_FILE_PATH,
            {
              regex: '^~~?/',
              message: 'server/ imports through #layers/..., never ~/ or ~~/.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        ...dynamicImportGuards([
          LAYER_PUBLIC_ENTRY,
          LAYER_FILE_PATH,
          { regex: '^~~?/', message: 'server/ imports through #layers/..., never ~/ or ~~/.' },
        ]),
      ],
    },
  },
  {
    ignores: ['supabase/migrations/**', 'design/**', 'docs/**'],
  },
)
