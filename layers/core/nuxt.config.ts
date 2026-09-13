export default defineNuxtConfig({
  components: [
    { path: 'components/ui', pathPrefix: false },
    { path: 'components/admin', pathPrefix: false },
  ],
  typescript: {
    tsConfig: {
      include: ['../layers/*/index.ts', '../layers/*/state/**/*', '../layers/*/data/**/*'],
    },
    sharedTsConfig: {
      include: ['../layers/*/domain/**/*', '../layers/*/test-support/**/*'],
    },
    nodeTsConfig: {
      include: ['../layers/*/tests/**/*'],
    },
  },
})
