import { createHash } from 'node:crypto'

export interface CspOptions {
  /** Supabase project host (storage images, auth and REST calls from the admin). */
  supabaseHost?: string
  /** `'sha256-…'` sources for the inline scripts of the response, or `'unsafe-inline'` in dev. */
  scriptSources: readonly string[]
  /** Delivered in a `<meta http-equiv>` tag, which ignores frame-ancestors; X-Frame-Options covers those pages. */
  meta?: boolean
}

// Fonts are self-hosted by @nuxt/fonts, so fonts.googleapis.com/gstatic.com aren't needed in style-src/font-src.
// GA4/Meta Pixel hosts are inert until NUXT_PUBLIC_GA_ID/NUXT_PUBLIC_META_PIXEL_ID are set; both loaders are
// external scripts (layers/consent/app/plugins/analytics.client.ts), so script-src needs no 'unsafe-inline'.
export function buildCsp({ supabaseHost, scriptSources, meta = false }: CspOptions): string {
  const supabase = supabaseHost ? ` https://${supabaseHost}` : ''
  const scripts = scriptSources.length ? ` ${scriptSources.join(' ')}` : ''
  return [
    `default-src 'self'`,
    `script-src 'self'${scripts} https://*.googletagmanager.com https://connect.facebook.net`,
    `style-src 'self' 'unsafe-inline'`,
    `font-src 'self'`,
    `img-src 'self' data:${supabase} https://*.google-analytics.com https://*.googletagmanager.com https://www.facebook.com`,
    `connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.facebook.com${supabase}`,
    ...(meta ? [] : [`frame-ancestors 'none'`]),
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
  ].join('; ')
}

// Script types the browser executes. Data blocks (application/ld+json, application/json) are not scripts.
const EXECUTABLE_TYPES = new Set(['', 'module', 'importmap', 'text/javascript', 'application/javascript'])

/**
 * `'sha256-…'` for every inline script the page runs: Nuxt's config and import map, the theme script.
 * The hash covers the raw text between the tags, which is what the browser hashes for a script element.
 */
export function inlineScriptHashes(html: string): string[] {
  const hashes = new Set<string>()
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = match[1] ?? ''
    const body = match[2] ?? ''
    if (!body || /\ssrc\s*=/i.test(attrs)) continue
    const type = (/\stype\s*=\s*["']?([^"'\s>]*)/i.exec(attrs)?.[1] ?? '').toLowerCase()
    if (!EXECUTABLE_TYPES.has(type)) continue
    hashes.add(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`)
  }
  return [...hashes]
}
