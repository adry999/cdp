/** Whether `roPath` is one of `pendingPaths`, ignoring a trailing slash. Each
 * module lists its own RO paths whose EN page still shows Romanian copy (see
 * TODO.md, "EN de tradus"); the root composes them in
 * app/utils/enPendingTranslation.ts. */
export function isEnPendingPath(pendingPaths: readonly string[], roPath: string): boolean {
  const path = roPath.replace(/\/$/, '') || '/'
  return pendingPaths.includes(path)
}
