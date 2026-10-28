export interface AdminCheckDependencies {
  getUser: () => Promise<{ id: string; aal?: string } | null>
  isAppUser: (id: string) => Promise<boolean>
}

export type AdminCheck =
  | { outcome: 'admin'; user: { id: string } }
  | { outcome: 'unauthenticated' }
  | { outcome: 'forbidden' }
  | { outcome: 'mfa_required' }

export async function checkAdmin(deps: AdminCheckDependencies): Promise<AdminCheck> {
  const user = await deps.getUser()
  if (!user) return { outcome: 'unauthenticated' }
  if (!(await deps.isAppUser(user.id))) return { outcome: 'forbidden' }
  // Password alone is not enough: the session must have passed the TOTP challenge.
  if (user.aal !== 'aal2') return { outcome: 'mfa_required' }
  return { outcome: 'admin', user: { id: user.id } }
}
