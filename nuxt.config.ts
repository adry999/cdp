import tailwindcss from '@tailwindcss/vite'

// A production build with no site URL set would silently ship canonical and
// hreflang tags pointing at localhost — the i18n.baseUrl default below. A
// production build with no Supabase URL/key would deploy an app that can
// never reach its database. nuxt dev runs with NODE_ENV=development, so
// local dev is unaffected; every real build (Vercel included) sets
// NODE_ENV=production and must supply all of these.
function assertEnv(names: string[]) {
  if (process.env.NODE_ENV !== 'production') return
  const missing = names.filter((name) => !process.env[name])
  if (missing.length) {
    throw new Error(
      `Missing required environment variable(s) for a production build: ${missing.join(', ')}. See .env.example.`,
    )
  }
}

assertEnv(['NUXT_PUBLIC_SITE_URL', 'NUXT_PUBLIC_SUPABASE_URL', 'NUXT_PUBLIC_SUPABASE_ANON_KEY'])

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// No hardcoded fallback here on purpose: in production assertEnv above
// already guarantees this is set. In dev, if it's missing, @nuxtjs/supabase
// logs its own warning at runtime — we just skip the host-scoped CSP/image
// entries below rather than inventing a URL to derive a host from.
const supabaseHost = process.env.NUXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NUXT_PUBLIC_SUPABASE_URL).hostname
  : undefined

// No CSP/frame/sniffing headers were configured anywhere — Nitro/Vercel ship
// none by default. 'unsafe-inline' on script-src is a real gap, not an
// oversight: the GA bootstrap and the Meta Pixel loader (layers/consent/app/
// plugins/analytics.client.ts) both inject inline <script> tags with no nonce/hash
// wiring in place, and both are currently inert (no ID configured) so this
// is the safe moment to add the header without breaking anything live.
// Tightening script-src to a nonce is real follow-up work, not done here.
const supabaseHostSrc = supabaseHost ? ` https://${supabaseHost}` : ''

const CSP = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' https://fonts.gstatic.com`,
  `img-src 'self' data:${supabaseHostSrc} https://www.facebook.com`,
  `connect-src 'self' https://www.google-analytics.com${supabaseHostSrc}`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
].join('; ')

export default defineNuxtConfig({
  compatibilityDate: '2026-08-05',
  devtools: { enabled: true },

  modules: ['@nuxtjs/i18n', '@nuxt/image', '@nuxt/fonts', '@nuxtjs/supabase', '@nuxt/content', '@nuxt/eslint'],

  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
    public: {
      gaId: process.env.NUXT_PUBLIC_GA_ID || '',
      metaPixelId: process.env.NUXT_PUBLIC_META_PIXEL_ID || '',
      siteUrl,
    },
  },

  nitro: {
    compressPublicAssets: { gzip: true, brotli: true },
  },

  // Client maps were being served from the public output directory — the
  // largest one was ~3 MB of original application source. Server maps stay on
  // for the trace we can actually read; nothing plugs the client half into an
  // error monitor yet, so there's nothing to gain from shipping it publicly.
  sourcemap: { client: false, server: true },

  routeRules: {
    // The locale-redirect middleware (layers/core/server/middleware/locale-redirect.ts)
    // always runs first regardless of this cache — it's global h3 middleware,
    // upstream of route-rule caching, not part of the cached handler. Once a
    // request lands on / or /en without being redirected away, the rendered
    // page is locale-fixed and identical for everyone, so caching it here is
    // safe; only the redirect *decision* must stay uncached (see the
    // Cache-Control: private, no-store header the middleware sets on 302s).
    '/': { swr: 60 },
    '/en': { swr: 60 },
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
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'X-Frame-Options': 'DENY',
      },
    },
  },

  image: {
    // On Vercel, delegate resizing to Vercel's own Image Optimization API
    // instead of bundling IPX/sharp — sharp is a native binary and building
    // locally on Windows produces a win32-x64 binary that Vercel's Linux
    // functions cannot load. The ipx fallback keeps `npm run dev` working
    // everywhere else.
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

  // `npm run typecheck` (vue-tsc -b over the .nuxt/tsconfig.*.json project
  // references) otherwise misses these root-level TS files — they aren't
  // under app/, server/ or a layer, so nothing pulls them in by default.
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
