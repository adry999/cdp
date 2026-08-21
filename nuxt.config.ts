import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-08-05',
  devtools: { enabled: true },

  modules: ['@nuxtjs/i18n', '@nuxt/image', '@nuxt/fonts', '@nuxtjs/supabase'],

  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
    public: {
      gaId: process.env.NUXT_PUBLIC_GA_ID || '',
      metaPixelId: process.env.NUXT_PUBLIC_META_PIXEL_ID || '',
    },
  },

  nitro: {
    compressPublicAssets: { gzip: true, brotli: true },
  },

  sourcemap: { client: true },

  routeRules: {
    '/proiecte/**': { swr: 300 },
    '/en/work/**': { swr: 300 },
    '/api/home': { swr: 60 },
    '/api/projects': { swr: 60 },
    '/api/projects/**': { swr: 300 },
  },

  image: {
    domains: ['xlrkuaxnkidslrhdelpm.supabase.co'],
  },

  supabase: {
    redirectOptions: {
      login: '/admin/login',
      callback: '/admin/login',
      include: ['/admin(/*)?'],
      exclude: ['/admin/login'],
    },
  },

  components: [
    { path: '~/components/site', pathPrefix: false },
    { path: '~/components/ui', pathPrefix: false },
    { path: '~/components/admin', pathPrefix: false },
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  i18n: {
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    defaultLocale: 'ro',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
    locales: [
      { code: 'ro', language: 'ro-RO', name: 'Română', file: 'ro.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    customRoutes: 'config',
    pages: {
      'proiecte-slug': {
        ro: '/proiecte/[slug]',
        en: '/work/[slug]',
      },
      confidentialitate: {
        ro: '/confidentialitate',
        en: '/privacy',
      },
    },
  },

  fonts: {
    provider: 'google',
    families: [
      { name: 'Inter Tight', weights: [400, 500, 600] },
      { name: 'JetBrains Mono', weights: [400, 500] },
    ],
  },

  app: {
    head: {
      titleTemplate: '%s · Codepedia',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },
})
