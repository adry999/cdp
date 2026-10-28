// A stored redirect may only point at a path on this site: one "/" followed by a character that is
// neither "/" nor "\" (browsers read "/\host" as "//host"). Mirrors the `redirects_to_path_local` constraint.
export function isLocalRedirectTarget(toPath: string): boolean {
  return /^\/[^/\\]/.test(toPath)
}
