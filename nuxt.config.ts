import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { crossLocalePageRedirects, redirectRouteRules } from './layers/core/shared/utils/localeRoutes'
import { TECH_ICONS } from './layers/core/shared/utils/techIcons'
import { STACK_GROUP_ICONS } from './layers/content/domain/stack'
import { CARD_ICONS } from './layers/card/domain/icons'
import { THEME_INIT_SCRIPT } from './layers/core/shared/utils/theme'

// Every real build must supply these. Skipped in dev and in
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
// Nitro's `swr: N` sends a bare `stale-while-revalidate` (no value), which proxies read as nothing; the
// object form sends `stale-while-revalidate=86400`.
const swrCache = (maxAge: number) => ({ cache: { swr: true, maxAge, staleMaxAge: 86400 } })
const hostSwrCache = (maxAge: number) => ({
  cache: { swr: true, maxAge, staleMaxAge: 86400, varies: ['host'] },
})

const PRERENDERED_PAGE_CACHE = 's-maxage=3600, stale-while-revalidate=86400'

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
  ? new URL(process.env.NUXT_PUBLIC_SUPABASE_URL).host
  : undefined

// Public base URL of the R2 media bucket, without a trailing slash. Optional: unset, project images stay on Supabase.
const mediaUrl = (process.env.NUXT_PUBLIC_MEDIA_URL || '').replace(/\/+$/, '')
const mediaHost = mediaUrl ? new URL(mediaUrl).host : undefined
// `host`, not `hostname`: it keeps the port of the local stack (127.0.0.1:55321). @nuxt/image matches the host
// with its port and IPX normalises the list to hostnames, so both accept it; production hosts have no port.


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
    // Every used icon is in the client bundle (also read during SSR), so the server ships no whole collections.
    serverBundle: false,
    clientBundle: { icons: [...new Set([...Object.values(TECH_ICONS), ...Object.values(STACK_GROUP_ICONS), ...Object.values(CARD_ICONS)])] },
  },

  // Node's built-in SQLite instead of the better-sqlite3 native addon — no compiled binary to build or ship.
  content: {
    experimental: { sqliteConnector: 'native' },
  },

  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
    // The default is Resend's sandbox sender, which only delivers to the Resend account owner's own address.
    // A sender on codepedia.* needs that domain verified in Resend (SPF/DKIM) first.
    mailFrom: process.env.MAIL_FROM || 'CODEPEDIA <onboarding@resend.dev>',
    mailTo: process.env.MAIL_TO || 'contact@codepedia.md',
    // Bearer secret for /api/health and /api/cache-clear (shared by both Hostinger apps); unset, both answer 404.
    cronSecret: process.env.CRON_SECRET || '',
    // Secret that Cloudflare sends in `x-codepedia-origin`; requests without it get 403. Empty = check off. NUXT_ORIGIN_SECRET also overrides it at runtime, no rebuild needed.
    originSecret: process.env.NUXT_ORIGIN_SECRET || '',
    // Cloudflare Turnstile on the public forms (/api/leads, /api/contact). Unset = no check, no widget.
    turnstileSecretKey: process.env.NUXT_TURNSTILE_SECRET_KEY || '',
    // Sitemap <lastmod> of the static pages (YYYY-MM-DD): they only change with a deploy.
    buildDate: new Date().toISOString().slice(0, 10),
    // Cloudflare R2 (S3 API) credentials for the admin media endpoints in layers/projects. Server-only.
    // R2_ENDPOINT + R2_REGION switch to any other S3-compatible store (the local Supabase stack: docs/DEPLOY_HOSTINGER.md).
    r2: {
      accountId: process.env.R2_ACCOUNT_ID || '',
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      bucket: process.env.R2_BUCKET || '',
      endpoint: process.env.R2_ENDPOINT || '',
      region: process.env.R2_REGION || '',
    },
    public: {
      mediaUrl,
      gaId: process.env.NUXT_PUBLIC_GA_ID || '',
      metaPixelId: process.env.NUXT_PUBLIC_META_PIXEL_ID || '',
      siteUrl,
      siteUrlRo: process.env.NUXT_PUBLIC_SITE_URL_RO || '',
      noindex: process.env.NUXT_PUBLIC_NOINDEX === 'true',
      grantsEnabled: process.env.NUXT_PUBLIC_GRANTS_ENABLED === 'true',
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '',
    },
  },

  nitro: {
    compressPublicAssets: { gzip: true, brotli: true },
    // The swr cache keeps serving the last good page or payload while Supabase fails, but in memory it is lost
    // on every restart (Hostinger stops idle apps) and the site goes 500 until the database answers again.
    // On disk it survives restarts; entries still expire per build (Nitro's integrity hash).
    storage: { cache: { driver: 'fsLite', base: './.data/cache' } },
  },

  // No source maps shipped: nothing consumes them (the largest client one was ~3 MB) and the server ones only grow the deploy.
  sourcemap: { client: false, server: false },

  routeRules: {
    // The redirect of / and /en by cookie, geo and domain runs in a middleware, before this cache. A cached
    // answer is Cache-Control s-maxage, which layers/core/server/plugins/locale-entry-headers.ts turns back
    // into `private, no-cache` + Vary before sending. The server render reads no cookie or header.
    '/': swrCache(300),
    '/en': swrCache(300),
    '/proiecte': swrCache(300),
    '/en/work': swrCache(300),
    '/proiecte/**': swrCache(300),
    '/en/work/**': swrCache(300),
    // Blog content lives in the repo: prerendered at build (URLs listed in layers/blog/nuxt.config.ts).
    // News comes from the database (like projects), so it is cached, not prerendered.
    '/noutati': swrCache(300),
    '/en/news': swrCache(300),
    '/noutati/**': swrCache(300),
    '/en/news/**': swrCache(300),
    // Prerendered files get no Cache-Control of their own, so Cloudflare's rule 4 would bypass them
    // (docs/DEPLOY_HOSTINGER.md); same edge lifetime as the other repo-content pages.
    '/blog': { prerender: true, headers: { 'Cache-Control': PRERENDERED_PAGE_CACHE } },
    '/en/blog': { prerender: true, headers: { 'Cache-Control': PRERENDERED_PAGE_CACHE } },
    '/blog/**': { prerender: true, headers: { 'Cache-Control': PRERENDERED_PAGE_CACHE } },
    '/en/blog/**': { prerender: true, headers: { 'Cache-Control': PRERENDERED_PAGE_CACHE } },
    '/servicii': swrCache(300),
    '/en/services': swrCache(300),
    '/servicii/**': swrCache(300),
    '/en/services/**': swrCache(300),
    // A service reached by its canonical id or the other locale's slug lands on the right page.
    '/servicii/web-app': { redirect: { to: '/servicii/aplicatie-web', statusCode: 301 } },
    '/servicii/ai-automation': { redirect: { to: '/servicii/automatizare-ai', statusCode: 301 } },
    '/servicii/grants': { redirect: { to: '/servicii/granturi', statusCode: 301 } },
    '/en/services/aplicatie-web': { redirect: { to: '/en/services/web-app', statusCode: 301 } },
    '/en/services/automatizare-ai': { redirect: { to: '/en/services/ai-automation', statusCode: 301 } },
    '/en/services/granturi': { redirect: { to: '/en/services/grants', statusCode: 301 } },
    // A page reached under the other locale's path (/en/proiecte, /work) lands on the right one. Blog posts: layers/blog/nuxt.config.ts.
    ...redirectRouteRules(crossLocalePageRedirects(LOCALIZED_PAGES)),
    // Content lives in the repo, but these pages embed the project menu, and Cloudflare is not purged after admin edits.
    '/despre': swrCache(300),
    '/en/about': swrCache(300),
    '/preturi': swrCache(300),
    '/en/pricing': swrCache(300),
    '/contact': swrCache(300),
    '/en/contact': swrCache(300),
    '/confidentialitate': swrCache(300),
    '/en/privacy': swrCache(300),
    // Business-card pages (layers/card): content in the repo, but the two projects come from the database.
    '/c': swrCache(300),
    '/c/**': swrCache(300),
    '/en/c': swrCache(300),
    '/en/c/**': swrCache(300),
    // These answer per host (RO/EN origin); Nitro's cache key is the path only, so key it on the host too.
    '/llms.txt': hostSwrCache(3600),
    '/llms-full.txt': hostSwrCache(3600),
    '/sitemap.xml': hostSwrCache(3600),
    '/robots.txt': hostSwrCache(3600),
    '/api/projects': swrCache(60),
    '/api/home/settings': swrCache(60),
    '/api/projects/**': swrCache(300),
    '/api/news': swrCache(60),
    '/api/news/**': swrCache(300),
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
    // Supabase stays until every image row points at R2.
    domains: [supabaseHost, mediaHost].filter((host): host is string => !!host),
    // Keeps a UI screenshot from being encoded at a much higher default quality for no visible gain.
    quality: 75,
    // The `sizes` attributes in the components pick slot widths whose 1x and 2x are in this set. The wNNN keys only carry a width.
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
    // Project images live in Supabase Storage under unique paths. Supabase answers `no-cache`, so ipx falls back to max-age=300 and sharp
    // re-encodes every image every few minutes. Uploads never overwrite (layers/projects/server/services/projectMedia.ts), so a year is
    // safe. Only remote (http) sources: local public/ files keep their names and their default.
    ipx: { http: { maxAge: 31536000 } },
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
    // @nuxt/fonts preloads only the first @font-face per family, in the order Google's CSS lists the subsets:
    // latin-ext (Inter Tight 90 KB) before latin (45 KB), which carries nearly every glyph on the page.
    // Moving latin to the front of the Google results makes it the preloaded one; the CSS keeps both faces
    // (disjoint unicode-range), so ș and ț still load their latin-ext file on demand.
    'fonts:providers'(providers) {
      const google = providers.google
      if (typeof google !== 'function') throw new Error('fonts:providers has no google provider — update nuxt.config.ts')
      providers.google = (...factoryArgs: Parameters<typeof google>) => {
        const provider = google(...factoryArgs)
        return Object.assign(
          async (...args: Parameters<typeof provider>) => {
            const resolved = await provider(...args)
            if (!resolved?.resolveFont) return resolved
            return {
              ...resolved,
              async resolveFont(...fontArgs: Parameters<typeof resolved.resolveFont>) {
                const result = await resolved.resolveFont(...fontArgs)
                if (!result) return result
                const latin = result.fonts.filter((font) => font.meta?.subset === 'latin')
                const rest = result.fonts.filter((font) => font.meta?.subset !== 'latin')
                return { ...result, fonts: [...latin, ...rest] }
              },
            }
          },
          { _name: provider._name, _options: provider._options },
        )
      }
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
