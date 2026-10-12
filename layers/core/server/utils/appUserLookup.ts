import { logAndThrow } from '#layers/core/server/utils/logAndThrow'

export interface AppUserQueryResult {
  data: { id: string } | null
  error: { message: string } | null
}

// Decides "is this user an admin" from the app_users lookup. A database failure is reported as
// 500, never as "not an admin": a silent 403 during an outage would hide the incident.
export async function hasAppUserRow(run: () => PromiseLike<AppUserQueryResult>): Promise<boolean> {
  const { data, error } = await run()
  if (error) logAndThrow('requireAdmin app_users lookup', error)
  return data !== null
}
