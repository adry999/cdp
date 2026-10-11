import { selectNavProjects } from '#layers/projects/domain/navProjects'
import type { NavProjectRow } from '#layers/projects/domain/projectSelect'

export interface ListNavProjectsDependencies {
  listPublishedNavRows: () => Promise<NavProjectRow[]>
}

/** Published projects for the header dropdown: at most four per service, featured first. */
export async function listNavProjects(deps: ListNavProjectsDependencies): Promise<NavProjectRow[]> {
  return selectNavProjects(await deps.listPublishedNavRows())
}
