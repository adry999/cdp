// Reads the authenticator assurance level from a Supabase access token. The signature is
// NOT verified: this only routes the admin UI (aal1 → code screen). Real enforcement is
// server-side (requireAdmin) and in the database (is_admin()).
export type SessionAal = 'aal1' | 'aal2'

export function sessionAal(accessToken: string | undefined): SessionAal | null {
  const payload = accessToken?.split('.')[1]
  if (!payload) return null
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = new TextDecoder().decode(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)))
    const aal = (JSON.parse(json) as { aal?: unknown } | null)?.aal
    return aal === 'aal1' || aal === 'aal2' ? aal : null
  } catch {
    return null
  }
}
