import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { localeRedirectRoutes } from './layers/core/shared/utils/localeRedirectRoutes'
import { crossLocalePageRedirects, redirectRouteRules, trailingSlashRoute } from './layers/core/shared/utils/localeRoutes'
import { TECH_ICONS } from './layers/core/shared/utils/techIcons'
import { STACK_GROUP_ICONS } from './layers/content/domain/stack'
import { THEME_INIT_SCRIPT } from './layers/core/shared/utils/theme'

// Every real build, including Vercel, must supply these. Skipped in dev and in
// `nuxt prepare` (the postinstall step), where hosts may not expose secrets yet.
function assertEnv(names: string[]) {
  if (process.env.NODE_ENV !== 'production' || process.argv.includes('prepare')) return
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

// The primary (EN) domain; NUXT_PUBLIC_SITE_URL_RO is the official RO domain and defaults to it.
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// @nuxtjs/supabase registers its browser client as a global plugin, which shipped all of
// supabase-js to every visitor. The plugin is dropped from the app (hooks below) and
// loaded on /admin only, by layers/core/app/middleware/admin-session.global.ts.
const SUPABASE_BROWSER_PLUGIN = '@nuxtjs/supabase/dist/runtime/plugins/supabase.client'

const STATIC_ASSET_CACHE = 'public, max-age=86400, stale-while-revalidate=604800'

// Client chunk grouping (vite.$client below). Module ids are absolute paths, so the project root
// anchors the match: `node_modules/nuxt/dist/app/**` must not count as app code.
const projectRoot = fileURLToPath(new URL('./', import.meta.url)).replace(/\\/g, '/')
const isProjectModule = (id: string) => {
  const path = id.replace(/\\/g, '/')
  return path.startsWith(projectRoot) && !path.includes('/node_modules/') && /^(layers|app)\//.test(path.slice(projectRoot.length))
}
// Admin code lives under admin/ directories, in the admin layouts and layer `admin.ts` entries, in
// Admin*/*Editor components and in modules with "Admin" in their name (leadsAdminRepository,
// useLeadsAdminList…) plus the few named here. Anything that matches stays out of `common`.
const isAdminModule = (id: string) =>
  /\/admin\/|\/admin(-auth)?\.vue$|\/admin\.ts$|Admin|Editor|adminProjectList|projectForm|newsForm|useNewLeadsCount/.test(
    id.replace(/\\/g, '/'),
  )

// Production guarantees this via assertEnv above; in dev a missing value just skips the host-scoped image entry below.
// The Content-Security-Policy header is set per response by layers/core/server/plugins/csp.ts (inline script hashes).
const supabaseHost = process.env.NUXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NUXT_PUBLIC_SUPABASE_URL).hostname
  : undefined


// Localized route paths (RO <-> EN). Also the source of the cross-locale redirects in routeRules.
const LOCALIZED_PAGES = {
  proiecte: {
    ro: '/proiecte',
    en: '/work',
  },
  'proiecte-slug': {
    ro: '/proiecte/[slug]',
    en: '/work/[slug]',
  },
  noutati: {
    ro: '/noutati',
    en: '/news',
  },
  'noutati-slug': {
    ro: '/noutati/[slug]',
    en: '/news/[slug]',
  },
  servicii: {
    ro: '/servicii',
    en: '/services',
  },
  'servicii-slug': {
    ro: '/servicii/[slug]',
    en: '/services/[slug]',
  },
  'blog-categorie-slug': {
    ro: '/blog/categorie/[slug]',
    en: '/blog/category/[slug]',
  },
  contact: {
    ro: '/contact',
    en: '/contact',
  },
  despre: {
    ro: '/despre',
    en: '/about',
  },
  preturi: {
    ro: '/preturi',
    en: '/pricing',
  },
  confidentialitate: {
    ro: '/confidentialitate',
    en: '/privacy',
  },
} as const

export default defineNuxtConfig({
  compatibilityDate: '2026-08-05',
  devtools: { enabled: true },
  telemetry: false,
  // Git worktrees for parallel branches live in .worktrees/; keep them out of scanning and the dev watcher.
  ignore: ['.worktrees/**'],

  modules: ['@nuxtjs/i18n', '@nuxt/image', '@nuxt/fonts', '@nuxtjs/supabase', '@nuxt/content', '@nuxt/eslint', '@nuxt/icon'],

  // Icons come only from the locally installed @iconify-json collections and are bundled into the
  // client: no runtime request to the Iconify API (CSP connect-src stays 'self').
  icon: {
    mode: 'svg',
    fallbackToApi: false,
    serverBundle: { collections: ['lucide', 'simple-icons'] },
    clientBundle: { icons: [...new Set([...Object.values(TECH_ICONS), ...Object.values(STACK_GROUP_ICONS)])], scan: false },
  },

  // Node's built-in SQLite instead of the better-sqlite3 native addon — no compiled binary to build or ship.
  content: {
    experimental: { sqliteConnector: 'native' },
  },

  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
    // Vercel Cron sends `Authorization: Bearer $CRON_SECRET`; unset, /api/health answers 404.
    cronSecret: process.env.CRON_SECRET || '',
    // Mirrors nitro.vercel.config.bypassToken below; server/api/admin/revalidate.post.ts sends it back as
    // `x-prerender-revalidate` to force an ISR refresh. Empty off Vercel falls back to a storage cache clear.
    isrBypassToken: process.env.VERCEL_ISR_BYPASS_TOKEN || '',
    // Sitemap <lastmod> of the static pages (YYYY-MM-DD): they only change with a deploy.
    buildDate: new Date().toISOString().slice(0, 10),
    public: {
      gaId: process.env.NUXT_PUBLIC_GA_ID || '',
      metaPixelId: process.env.NUXT_PUBLIC_META_PIXEL_ID || '',
      siteUrl,
      siteUrlRo: process.env.NUXT_PUBLIC_SITE_URL_RO || '',
      noindex: process.env.NUXT_PUBLIC_NOINDEX === 'true',
      heroBgVariant: (process.env.NUXT_PUBLIC_HERO_BG_VARIANT as string) || 'dot-matrix',
      grantsEnabled: process.env.NUXT_PUBLIC_GRANTS_ENABLED === 'true',
    },
  },

  nitro: {
    compressPublicAssets: { gzip: true, brotli: true },
    // On the `vercel` preset, routeRules with `swr`/`isr` become separate Vercel Prerender Functions served
    // straight from the edge — this token lets revalidate.post.ts force one to bypass and refresh.
    vercel: {
      config: {
        bypassToken: process.env.VERCEL_ISR_BYPASS_TOKEN || undefined,
        // Run before the ISR cache, so / and /en can be cached and still redirect by language.
        routes: [trailingSlashRoute(), ...localeRedirectRoutes()],
      },
    },
  },

  // Client source maps aren't shipped (nothing consumes them yet, and the largest was ~3 MB); server maps stay on.
  sourcemap: { client: false, server: true },

  routeRules: {
    // / and /en redirect by language before the cache (nitro.vercel.config.routes above).
    '/': { swr: 300 },
    '/en': { swr: 300 },
    '/proiecte': { swr: 300 },
    '/en/work': { swr: 300 },
    '/proiecte/**': { swr: 300 },
    '/en/work/**': { swr: 300 },
    // Blog content lives in the repo: prerendered at build (URLs listed in layers/blog/nuxt.config.ts).
    // News comes from the database (like projects), so it is cached, not prerendered.
    '/noutati': { swr: 300 },
    '/en/news': { swr: 300 },
    '/noutati/**': { swr: 300 },
    '/en/news/**': { swr: 300 },
    '/blog': { prerender: true },
    '/en/blog': { prerender: true },
    '/blog/**': { prerender: true },
    '/en/blog/**': { prerender: true },
    '/servicii': { swr: 300 },
    '/en/services': { swr: 300 },
    '/servicii/**': { swr: 300 },
    '/en/services/**': { swr: 300 },
    // A service reached by its canonical id or the other locale's slug lands on the right page.
    '/servicii/web-app': { redirect: { to: '/servicii/aplicatie-web', statusCode: 301 } },
    '/servicii/ai-automation': { redirect: { to: '/servicii/automatizare-ai', statusCode: 301 } },
    '/servicii/grants': { redirect: { to: '/servicii/granturi', statusCode: 301 } },
    '/en/services/aplicatie-web': { redirect: { to: '/en/services/web-app', statusCode: 301 } },
    '/en/services/automatizare-ai': { redirect: { to: '/en/services/ai-automation', statusCode: 301 } },
    '/en/services/granturi': { redirect: { to: '/en/services/grants', statusCode: 301 } },
    // A page reached under the other locale's path (/en/proiecte, /work) lands on the right one. Blog posts: layers/blog/nuxt.config.ts.
    ...redirectRouteRules(crossLocalePageRedirects(LOCALIZED_PAGES)),
    // Content lives in the repo, so it only changes with a deploy, which clears the cache.
    '/despre': { swr: 3600 },
    '/en/about': { swr: 3600 },
    '/preturi': { swr: 3600 },
    '/en/pricing': { swr: 3600 },
    '/contact': { swr: 3600 },
    '/en/contact': { swr: 3600 },
    '/confidentialitate': { swr: 3600 },
    '/en/privacy': { swr: 3600 },
    '/llms.txt': { swr: 3600 },
    '/llms-full.txt': { swr: 3600 },
    '/api/projects': { swr: 60 },
    '/api/home/settings': { swr: 60 },
    '/api/projects/**': { swr: 300 },
    '/api/news': { swr: 60 },
    '/api/news/**': { swr: 300 },
    // Static assets from public/ keep their names across deploys (no content hash), so no `immutable`:
    // a day fresh, then a week of stale-while-revalidate instead of the platform default of revalidating every time.
    '/brand/**': { headers: { 'Cache-Control': STATIC_ASSET_CACHE } },
    '/og/**': { headers: { 'Cache-Control': STATIC_ASSET_CACHE } },
    '/og-image.png': { headers: { 'Cache-Control': STATIC_ASSET_CACHE } },
    '/favicon.svg': { headers: { 'Cache-Control': STATIC_ASSET_CACHE } },
    '/favicon.ico': { headers: { 'Cache-Control': STATIC_ASSET_CACHE } },
    '/icon-192.png': { headers: { 'Cache-Control': STATIC_ASSET_CACHE } },
    '/icon-512.png': { headers: { 'Cache-Control': STATIC_ASSET_CACHE } },
    '/icon-maskable-512.png': { headers: { 'Cache-Control': STATIC_ASSET_CACHE } },
    '/apple-touch-icon.png': { headers: { 'Cache-Control': STATIC_ASSET_CACHE } },
    '/admin': { redirect: { to: '/admin/projects', statusCode: 302 } },
    '/admin/**': { headers: { 'Cache-Control': 'private, no-store' } },
    '/api/admin/**': { headers: { 'Cache-Control': 'private, no-store' } },

    '/**': {
      headers: {
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
    // The vercel provider defaults to q=100, which more than doubles the bytes of a UI screenshot for no visible gain.
    quality: 75,
    // The vercel provider only serves these exact widths (they become `images.sizes` in the build output) and rounds
    // any other request up. The `sizes` attributes in the components pick slot widths whose 1x and 2x are in this set,
    // so each srcset descriptor is a width Vercel really serves. The wNNN keys only carry a width.
    screens: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
      w320: 320,
      w400: 400,
      w480: 480,
      w800: 800,
      w960: 960,
      w1600: 1600,
      w1200: 1200,
      w1920: 1920,
    },
    // Project images live in Supabase Storage under unique paths, so a day of caching saves re-optimizing them.
    ...(process.env.VERCEL ? { vercel: { minimumCacheTTL: 86400 } } : {}),
  },

  supabase: {
    types: '~~/layers/core/shared/types/database.types.ts',
    // The /admin login redirect lives in admin-session.global.ts, next to the client it waits for.
    redirect: false,
  },

  alias: {
    '#supabase-browser-plugin': fileURLToPath(new URL(`./node_modules/${SUPABASE_BROWSER_PLUGIN}`, import.meta.url)),
  },

  hooks: {
    'app:resolve'(app) {
      const before = app.plugins.length
      app.plugins = app.plugins.filter((plugin) => !plugin.src.replace(/\\/g, '/').includes(SUPABASE_BROWSER_PLUGIN))
      // A module upgrade that moves the plugin must fail the build, not silently ship it again.
      if (app.plugins.length === before) throw new Error(`${SUPABASE_BROWSER_PLUGIN} not found — update nuxt.config.ts`)
    },
    // Otherwise every public page still prefetches the now-lazy supabase-js chunks and the admin
    // layouts with their imports (Nuxt lists the imports of a lazy layout even when the layout itself
    // is not prefetched). Keys are source paths or chunk names, so the same admin convention applies.
    'build:manifest'(manifest) {
      for (const [key, chunk] of Object.entries(manifest)) {
        const ids = [key, chunk.file ?? '']
        if (ids.some((id) => /supabase/i.test(id) || /^(_nuxt\/)?_?admin(-auth)?-/.test(id) || isAdminModule(id))) {
          chunk.prefetch = false
        }
      }
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
    $client: {
      build: {
        rolldownOptions: {
          output: {
            // Nuxt names production chunks `[hash].js`; keeping the name lets the build:manifest hook
            // above recognise the supabase and admin chunks it must not prefetch.
            chunkFileNames: '_nuxt/[name]-[hash].js',
            // Rolldown's automatic splitting left ~135 client chunks, 89 of them under 2 KB (shared
            // utilities split out on their own), so every page preloaded ~50–65 modules. Shared app
            // modules are collected into one `common` chunk instead. supabase-js and the admin-only
            // modules keep their own chunks, so public pages never load them (see PR #21).
            codeSplitting: {
              groups: [
                { name: 'supabase', test: /node_modules[/\\]@supabase[/\\]/, priority: 20 },
                // Shared modules of the public site only: anything admin-related (editors, admin pages and
                // components, their state and data) stays out, so public pages never download it.
                {
                  name: 'common',
                  test: (id: string) => isProjectModule(id) && !isAdminModule(id),
                  minShareCount: 2,
                  minSize: 10000,
                  priority: 5,
                },
              ],
            },
          },
        },
      },
    },
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
    pages: LOCALIZED_PAGES,
  },

  fonts: {
    provider: 'google',
    // Only the faces the site renders: upright, Latin + Latin Extended (ă â î ș ț). Preloading them lets the
    // fonts download alongside the CSS instead of after it, which moves the text LCP forward on mobile.
    families: [
      { name: 'Inter Tight', weights: [400, 500, 600], styles: ['normal'], subsets: ['latin', 'latin-ext'], preload: true },
      { name: 'JetBrains Mono', weights: [400, 500], styles: ['normal'], subsets: ['latin', 'latin-ext'], preload: true },
    ],
  },

  app: {
    head: {
      titleTemplate: '%s · CODEPEDIA',
      // Sets data-theme before first paint (no flash). Covered by the existing 'unsafe-inline' in script-src.
      script: [{ innerHTML: THEME_INIT_SCRIPT, tagPosition: 'head', tagPriority: 'critical' }],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },
})
