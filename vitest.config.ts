import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '#layers/core': fileURLToPath(new URL('./layers/core', import.meta.url)),
      '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
  test: {
    include: ['test/unit/**/*.test.ts', 'layers/**/*.test.ts'],
    environment: 'node',
  },
})
