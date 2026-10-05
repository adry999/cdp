export interface AdminCheckDependencies {
  getUser: () => Promise<{ id: string } | null>
  isAppUser: (id: string) => Promise<boolean>
}

export type AdminCheck =
  | { outcome: 'admin'; user: { id: string } }
  | { outcome: 'unauthenticated' }
  | { outcome: 'forbidden' }

export async function checkAdmin(deps: AdminCheckDependencies): Promise<AdminCheck> {
  const user = await deps.getUser()
  if (!user) return { outcome: 'unauthenticated' }
  if (!(await deps.isAppUser(user.id))) return { outcome: 'forbidden' }
  return { outcome: 'admin', user }
}
