// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

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
  {
    files: ['layers/core/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { regex: '^#layers/(?!core(/|$))', message: 'layers/core must not import a feature layer.' },
            { regex: '^(~|~~|@|@@|#shared)/', message: 'layers/core must not import root app/, server/ or shared/ code.' },
            { regex: '^(\\.\\./){2,}', message: 'Inside layers/core use #layers/core/... paths; never climb out of the layer.' },
          ],
        },
      ],
    },
  },
  {
    ignores: ['supabase/migrations/**', 'design/**', 'docs/**'],
  },
)
