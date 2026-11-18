/**
 * True when a Supabase key grants full database access: a new-style secret key (`sb_secret_…`) or a
 * legacy JWT whose role is `service_role`. Such a key must never be the public (browser) key, which
 * Nuxt writes into every page's runtime config.
 */
export function isSecretSupabaseKey(key: string): boolean {
  const value = key.trim()
  if (value.startsWith('sb_secret_')) return true
  const payload = value.split('.')[1]
  if (!payload) return false
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=')
    const claims: unknown = JSON.parse(atob(base64))
    return typeof claims === 'object' && claims !== null && (claims as { role?: unknown }).role === 'service_role'
  } catch {
    return false
  }
}
