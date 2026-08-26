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
  {
    ignores: ['supabase/migrations/**', 'design/**', 'docs/**'],
  },
)
