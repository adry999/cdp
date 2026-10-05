import tailwindcss from '@tailwindcss/vite'

// Skipped outside production (nuxt dev) — every real build, including Vercel, must supply these.
function assertEnv(names: string[]) {
  if (process.env.NODE_ENV !== 'production') return
  const missing = names.filter((name) => !process.env[name])
  if (missing.length) {
    throw new Error(
      `Missing required environment variable(s) for a production build: ${missing.join(', ')}. See .env.example.`,
    )
  }
}

assertEnv([
  'NUXT_PUBLIC_SITE_URL',
  'NUXT_PUBLIC_SUPABASE_URL',
  'NUXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
])

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// Production guarantees this via assertEnv above; in dev a missing value just skips the host-scoped CSP/image entries below.
const supabaseHost = process.env.NUXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NUXT_PUBLIC_SUPABASE_URL).hostname
  : undefined

// 'unsafe-inline' on script-src is required by the inline GA/Meta Pixel loaders in layers/consent/app/plugins/analytics.client.ts.
const supabaseHostSrc = supabaseHost ? ` https://${supabaseHost}` : ''

// Fonts are self-hosted by @nuxt/fonts, so fonts.googleapis.com/gstatic.com aren't needed in style-src/font-src.
// GA4/Meta Pixel hosts below are inert until NUXT_PUBLIC_GA_ID/NUXT_PUBLIC_META_PIXEL_ID are set.
const CSP = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://connect.facebook.net`,
  `style-src 'self' 'unsafe-inline'`,
  `font-src 'self'`,
  `img-src 'self' data:${supabaseHostSrc} https://*.google-analytics.com https://*.googletagmanager.com https://www.facebook.com`,
  `connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.facebook.com${supabaseHostSrc}`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
].join('; ')

export default defineNuxtConfig({
  compatibilityDate: '2026-08-05',
  devtools: { enabled: true },

  modules: ['@nuxtjs/i18n', '@nuxt/image', '@nuxt/fonts', '@nuxtjs/supabase', '@nuxt/content', '@nuxt/eslint'],

  // Node's built-in SQLite instead of the better-sqlite3 native addon — no compiled binary to build or ship.
  content: {
    experimental: { sqliteConnector: 'native' },
  },

  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
    // Mirrors nitro.vercel.config.bypassToken below; server/api/admin/revalidate.post.ts sends it back as
    // `x-prerender-revalidate` to force an ISR refresh. Empty off Vercel falls back to a storage cache clear.
    isrBypassToken: process.env.VERCEL_ISR_BYPASS_TOKEN || '',
    public: {
      gaId: process.env.NUXT_PUBLIC_GA_ID || '',
      metaPixelId: process.env.NUXT_PUBLIC_META_PIXEL_ID || '',
      siteUrl,
    },
  },

  nitro: {
    compressPublicAssets: { gzip: true, brotli: true },
    // On the `vercel` preset, routeRules with `swr`/`isr` become separate Vercel Prerender Functions served
    // straight from the edge — this token lets revalidate.post.ts force one to bypass and refresh.
    vercel: {
      config: {
        bypassToken: process.env.VERCEL_ISR_BYPASS_TOKEN || undefined,
      },
    },
  },

  // Client source maps aren't shipped (nothing consumes them yet, and the largest was ~3 MB); server maps stay on.
  sourcemap: { client: false, server: true },

  routeRules: {
    // No ISR on / and /en: Vercel cache hits would skip the locale-redirect middleware.
    '/proiecte': { swr: 300 },
    '/en/work': { swr: 300 },
    '/proiecte/**': { swr: 300 },
    '/en/work/**': { swr: 300 },
    '/blog': { swr: 300 },
    '/en/blog': { swr: 300 },
    '/blog/**': { swr: 300 },
    '/en/blog/**': { swr: 300 },
    '/api/projects': { swr: 60 },
    '/api/projects/**': { swr: 300 },

    '/**': {
      headers: {
        'Content-Security-Policy': CSP,
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'X-Frame-Options': 'DENY',
      },
    },
  },

  image: {
    // vercel provider avoids bundling sharp, whose native binary built on Windows can't load in Vercel's Linux functions.
    provider: process.env.VERCEL ? 'vercel' : 'ipx',
    domains: supabaseHost ? [supabaseHost] : [],
  },

  supabase: {
    types: '~~/layers/core/shared/types/database.types.ts',
    redirectOptions: {
      login: '/admin/login',
      callback: '/admin/login',
      include: ['/admin(/*)?'],
      exclude: ['/admin/login'],
    },
  },

  // vue-tsc otherwise misses these root-level TS files since they're outside app/, server/, and layers/.
  typescript: {
    nodeTsConfig: {
      include: ['../e2e/**/*.ts', '../playwright.config.ts', '../vitest.config.ts'],
    },
  },

  components: [
    { path: '~/components/site', pathPrefix: false },
    { path: '~/components/admin', pathPrefix: false },
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  i18n: {
    baseUrl: siteUrl,
    defaultLocale: 'ro',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
    locales: [
      { code: 'ro', language: 'ro-RO', name: 'Română', file: 'ro.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    customRoutes: 'config',
    pages: {
      proiecte: {
        ro: '/proiecte',
        en: '/work',
      },
      'proiecte-slug': {
        ro: '/proiecte/[slug]',
        en: '/work/[slug]',
      },
      servicii: {
        ro: '/servicii',
        en: '/services',
      },
      'servicii-slug': {
        ro: '/servicii/[slug]',
        en: '/services/[slug]',
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
