import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '#layers': fileURLToPath(new URL('./layers', import.meta.url)),
    },
  },
  test: {
    include: ['layers/**/*.test.ts'],
    environment: 'node',
  },
})
