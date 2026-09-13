// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

function layerBoundary(layer, dependencies) {
  const allowed = [layer, ...dependencies].join('|')
  return {
    files: [`layers/${layer}/**/*.{ts,vue}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: `^#layers/(?!(${allowed})(/|$))`,
              message: dependencies.length
                ? `layers/${layer} may import only ${dependencies.join(', ')} besides itself.`
                : `layers/${layer} must not import another layer.`,
            },
            { regex: '^(~|~~|@|@@|#shared)/', message: `layers/${layer} must not import root app/, server/ or shared/ code.` },
            {
              regex: '^(\\.\\./){2,}',
              message: `Inside layers/${layer} use #layers/${layer}/... paths; never climb out of the layer.`,
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
  // A layer joins this boundary list in the same commit that migrates it.
  layerBoundary('core', []),
  layerBoundary('consent', ['core']),
  {
    files: ['app/**/*.{ts,vue}', 'server/**/*.ts', 'shared/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^#layers/(?!core/)[^/]+/(?!server$)',
              message: 'Import a feature layer only through #layers/<layer> or #layers/<layer>/server.',
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
