/** Paths that act on the admin session. Everywhere else the response is public
 * and may be cached, so it must render as an anonymous visitor would see it. */
export function needsAuthCookies(path: string): boolean {
  return /^\/(api\/)?admin(\/|$|\?)/.test(path)
}

/** The Cookie header without Supabase's `sb-*` auth cookies, or undefined when nothing is left. */
export function withoutAuthCookies(cookieHeader: string): string | undefined {
  const kept = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith('sb-'))
  return kept.length ? kept.join('; ') : undefined
}
