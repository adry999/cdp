import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '#layers': fileURLToPath(new URL('./layers', import.meta.url)),
      '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
  test: {
    include: ['test/unit/**/*.test.ts', 'layers/**/*.test.ts'],
    environment: 'node',
  },
})
