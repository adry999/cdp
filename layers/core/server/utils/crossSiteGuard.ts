const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

// Defence in depth for cookie-authenticated admin APIs, on top of SameSite=Lax: a state-changing
// request the browser itself labels cross-site is refused. A missing header (old browsers,
// curl, server-to-server calls) is allowed.
export function isCrossSiteAdminWrite(method: string, path: string, secFetchSite: string | undefined): boolean {
  if (SAFE_METHODS.has(method.toUpperCase())) return false
  if (!path.startsWith('/api/admin/')) return false
  return secFetchSite === 'cross-site'
}
