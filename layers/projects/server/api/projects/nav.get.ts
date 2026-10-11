import { createProjectRepository } from '#layers/projects/server/repository/projectRepository'
import { listNavProjects } from '#layers/projects/server/services/listNavProjects'

export default defineEventHandler(async (event) => {
  const repository = createProjectRepository(event)
  return await listNavProjects({ listPublishedNavRows: () => repository.listPublishedNavRows() })
})
